import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

// POST - Add new item to checklist
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
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { message: "Valid text is required" },
        { status: 400 }
      )
    }

    // Verify checklist exists and user owns it
    const checklist = await db.checklist.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: {
            order: "desc",
          },
          take: 1,
        },
      },
    })

    if (!checklist) {
      return NextResponse.json(
        { message: "Checklist not found" },
        { status: 404 }
      )
    }

    // Get max order and add 1
    const maxOrder = checklist.items.length > 0 ? checklist.items[0].order : -1
    const newOrder = maxOrder + 1

    // Create new item
    const item = await db.checklistItem.create({
      data: {
        text,
        order: newOrder,
        sourceTemplate: "Manual",
        checklistId: params.id,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    console.error("Create item error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

// PATCH - Toggle item completion
export async function PATCH(
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
    const body = await request.json()
    const { itemId, completed } = body

    if (!itemId || typeof completed !== "boolean") {
      return NextResponse.json(
        { message: "Valid itemId and completed boolean required" },
        { status: 400 }
      )
    }

    // Verify item belongs to user's checklist
    const item = await db.checklistItem.findFirst({
      where: {
        id: itemId,
        checklist: {
          id: params.id,
          userId: session.user.id,
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      )
    }

    // Update completion status
    const updatedItem = await db.checklistItem.update({
      where: {
        id: itemId,
      },
      data: {
        completed,
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    console.error("Update item error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

// DELETE - Remove item from checklist
export async function DELETE(
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
    const body = await request.json()
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json(
        { message: "Valid itemId required" },
        { status: 400 }
      )
    }

    // Verify item belongs to user's checklist
    const item = await db.checklistItem.findFirst({
      where: {
        id: itemId,
        checklist: {
          id: params.id,
          userId: session.user.id,
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      )
    }

    // Delete item
    await db.checklistItem.delete({
      where: {
        id: itemId,
      },
    })

    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Delete item error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

// PUT - Reorder items
export async function PUT(
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
    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { message: "Updates must be an array" },
        { status: 400 }
      )
    }

    // Validate updates format
    for (const update of updates) {
      if (!update.itemId || typeof update.order !== "number") {
        return NextResponse.json(
          { message: "Each update must have itemId and order" },
          { status: 400 }
        )
      }
    }

    // Verify checklist exists and user owns it
    const checklist = await db.checklist.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    })

    if (!checklist) {
      return NextResponse.json(
        { message: "Checklist not found" },
        { status: 404 }
      )
    }

    // Verify all items belong to this checklist
    const itemIds = new Set(checklist.items.map(item => item.id))
    for (const update of updates) {
      if (!itemIds.has(update.itemId)) {
        return NextResponse.json(
          { message: "One or more items do not belong to this checklist" },
          { status: 403 }
        )
      }
    }

    // Update all order values in transaction
    await db.$transaction(
      updates.map(update =>
        db.checklistItem.update({
          where: { id: update.itemId },
          data: { order: update.order },
        })
      )
    )

    return NextResponse.json(
      { message: "Items reordered successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Reorder items error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
