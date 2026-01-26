import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const templates = await db.template.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(templates)
  } catch (error: any) {
    console.error("Get templates error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, items } = body

    // Validate inputs
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Valid name is required" },
        { status: 400 }
      )
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { message: "Items must be an array" },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.text || typeof item.text !== "string") {
        return NextResponse.json(
          { message: "Each item must have a text field" },
          { status: 400 }
        )
      }
      if (typeof item.order !== "number") {
        return NextResponse.json(
          { message: "Each item must have an order number" },
          { status: 400 }
        )
      }
    }

    // Create template with items
    const template = await db.template.create({
      data: {
        name,
        userId: session.user.id,
        items: {
          create: items.map((item: { text: string; order: number }) => ({
            text: item.text,
            order: item.order,
          })),
        },
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error: any) {
    console.error("Create template error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
