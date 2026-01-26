import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const params = await context.params

    // Check if template exists and user owns it
    const template = await db.template.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    })

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { text } = body

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { message: "Valid text is required" },
        { status: 400 }
      )
    }

    // Get next order number
    const maxOrder = template.items.length > 0
      ? Math.max(...template.items.map(item => item.order))
      : -1

    // Create new item
    const item = await db.templateItem.create({
      data: {
        text,
        order: maxOrder + 1,
        templateId: params.id,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    console.error("Create template item error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { itemId, text, order } = body

    // Validate itemId
    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json(
        { message: "Valid itemId is required" },
        { status: 400 }
      )
    }

    // Get item and verify user owns the template
    const item = await db.templateItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        template: true,
      },
    })

    if (!item || item.template.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      )
    }

    // Validate updates
    const updateData: any = {}
    if (text !== undefined) {
      if (typeof text !== "string" || !text) {
        return NextResponse.json(
          { message: "Valid text is required" },
          { status: 400 }
        )
      }
      updateData.text = text
    }

    if (order !== undefined) {
      if (typeof order !== "number" || order < 0) {
        return NextResponse.json(
          { message: "Valid order number is required" },
          { status: 400 }
        )
      }
      updateData.order = order
    }

    // Update item
    const updatedItem = await db.templateItem.update({
      where: {
        id: itemId,
      },
      data: updateData,
    })

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    console.error("Update template item error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { itemId } = body

    // Validate itemId
    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json(
        { message: "Valid itemId is required" },
        { status: 400 }
      )
    }

    // Get item and verify user owns the template
    const item = await db.templateItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        template: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!item || item.template.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      )
    }

    // Delete the item
    await db.templateItem.delete({
      where: {
        id: itemId,
      },
    })

    // Renumber remaining items
    const remainingItems = item.template.items
      .filter(i => i.id !== itemId)
      .sort((a, b) => a.order - b.order)

    for (let i = 0; i < remainingItems.length; i++) {
      if (remainingItems[i].order !== i) {
        await db.templateItem.update({
          where: {
            id: remainingItems[i].id,
          },
          data: {
            order: i,
          },
        })
      }
    }

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error("Delete template item error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
