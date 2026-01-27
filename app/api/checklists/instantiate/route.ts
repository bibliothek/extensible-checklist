import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, templateIds } = body

    // Validate input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Checklist name is required" },
        { status: 400 }
      )
    }

    if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
      return NextResponse.json(
        { error: "At least one template ID is required" },
        { status: 400 }
      )
    }

    // Fetch all specified templates with items
    const templates = await db.template.findMany({
      where: {
        id: { in: templateIds },
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    })

    // Verify all templates exist and belong to user
    if (templates.length !== templateIds.length) {
      return NextResponse.json(
        { error: "One or more templates not found or not owned by user" },
        { status: 404 }
      )
    }

    // Create a map for quick template lookup by ID
    const templateMap = new Map(templates.map((t) => [t.id, t]))

    // Merge items preserving selection order with deduplication
    const seenTexts = new Set<string>()
    const mergedItems: Array<{
      text: string
      order: number
      sourceTemplate: string
    }> = []

    let orderCounter = 0

    // Process templates in the order they were selected
    for (const templateId of templateIds) {
      const template = templateMap.get(templateId)
      if (!template) continue

      // Process items from this template
      for (const item of template.items) {
        // Deduplicate: skip if text already seen (case-sensitive exact match)
        if (seenTexts.has(item.text)) {
          continue
        }

        // Add to merged list
        mergedItems.push({
          text: item.text,
          order: orderCounter++,
          sourceTemplate: template.name,
        })

        seenTexts.add(item.text)
      }
    }

    // Create checklist and items in a transaction
    const userId = session.user.id! // Safe to assert - auth check above ensures this exists
    const checklist = await db.$transaction(async (tx) => {
      // Create the checklist
      const newChecklist = await tx.checklist.create({
        data: {
          name: name.trim(),
          userId,
          items: {
            create: mergedItems.map((item) => ({
              text: item.text,
              order: item.order,
              sourceTemplate: item.sourceTemplate,
              completed: false,
            })),
          },
        },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
        },
      })

      return newChecklist
    })

    return NextResponse.json(checklist, { status: 201 })
  } catch (error) {
    console.error("Error creating checklist:", error)
    return NextResponse.json(
      { error: "Failed to create checklist" },
      { status: 500 }
    )
  }
}
