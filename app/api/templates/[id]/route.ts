import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const template = await db.template.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error: any) {
    console.error("Get template error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if template exists and user owns it
    const existingTemplate = await db.template.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      )
    }

    // Validate name if provided
    if (name !== undefined && (typeof name !== "string" || !name)) {
      return NextResponse.json(
        { message: "Valid name is required" },
        { status: 400 }
      )
    }

    // Validate items if provided
    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return NextResponse.json(
          { message: "Items must be an array" },
          { status: 400 }
        )
      }

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
    }

    // Update template
    const updateData: any = {}
    if (name !== undefined) {
      updateData.name = name
    }

    if (items !== undefined) {
      // Delete existing items and create new ones
      await db.templateItem.deleteMany({
        where: {
          templateId: params.id,
        },
      })
      updateData.items = {
        create: items.map((item: { text: string; order: number }) => ({
          text: item.text,
          order: item.order,
        })),
      }
    }

    const template = await db.template.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error("Update template error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if template exists and user owns it
    const existingTemplate = await db.template.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      )
    }

    // Delete template (cascade will delete items)
    await db.template.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error("Delete template error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
