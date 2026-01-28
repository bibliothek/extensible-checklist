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

    // Fetch all user templates with items (same pattern as /api/templates)
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

    // Generate markdown content
    let markdown = ""

    for (const template of templates) {
      // Add template name as heading
      markdown += `## ${template.name}\n\n`

      // Add each item as checkbox
      for (const item of template.items) {
        markdown += `- [ ] ${item.text}\n`
      }

      // Add blank line between templates
      markdown += "\n"
    }

    // Generate timestamp for filename
    const now = new Date()
    const timestamp = now.toISOString()
      .replace(/T/, "-")
      .replace(/:/g, "")
      .split(".")[0] // YYYY-MM-DD-HHmmss

    const filename = `templates-${timestamp}.md`

    // Return markdown file with download headers
    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("Export templates error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
