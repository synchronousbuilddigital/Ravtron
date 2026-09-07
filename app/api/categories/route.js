import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { verifyAdmin } from "@/lib/auth";
import { getCachedCategories, setCachedCategories, clearCategoriesCache, clearProductsCache } from "@/lib/cache";
import { verifyCsrfOrigin } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Serve from cache if available (5-minute TTL)
    const cached = getCachedCategories();
    if (cached) {
      return NextResponse.json(cached);
    }

    // First request: connect to real database and cache the result
    await dbConnect();
    const rawCategories = await Category.find({}).lean();
    const categories = rawCategories.sort((a, b) => {
      const aPos = a.homePosition > 0 ? a.homePosition : 999;
      const bPos = b.homePosition > 0 ? b.homePosition : 999;
      if (aPos !== bPos) return aPos - bPos;
      return (a.name || "").localeCompare(b.name || "");
    });
    setCachedCategories(categories);

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }
    await dbConnect();
    const body = await request.json();
    
    // Check if category already exists
    const existing = await Category.findOne({ name: body.name });
    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }
    
    const newCategory = await Category.create(body);
    
    // Invalidate categories cache
    clearCategoriesCache();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    
    if (!name) {
      return NextResponse.json({ error: "Category name parameter is required" }, { status: 400 });
    }
    
    const deleted = await Category.findOneAndDelete({ name });
    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    
    // Invalidate categories cache
    clearCategoriesCache();

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }
    await dbConnect();
    const body = await request.json();
    const { name, newName, image, showOnHome, homePosition, subcategories } = body;
    
    if (!name) {
      return NextResponse.json({ error: "Category name parameter is required" }, { status: 400 });
    }
    
    const updateData = {};
    if (newName && newName.trim() !== name) {
      const exists = await Category.findOne({ name: newName.trim() });
      if (exists) {
        return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
      }
      updateData.name = newName.trim();
    }
    if (image !== undefined) updateData.image = image;
    if (showOnHome !== undefined) updateData.showOnHome = showOnHome;
    if (subcategories !== undefined && Array.isArray(subcategories)) {
      updateData.subcategories = subcategories.map((s) => s.trim()).filter(Boolean);
    }

    // Handle homePosition: 0 = hidden, 1-6 = slot on home page
    if (homePosition !== undefined) {
      const pos = Number(homePosition);
      updateData.homePosition = pos;
      updateData.showOnHome = pos > 0;

      // If assigning a real slot/position, clear it from any other category that already holds it
      if (pos >= 1) {
        await Category.updateMany(
          { name: { $ne: name }, homePosition: pos },
          { $set: { homePosition: 0, showOnHome: false } }
        );
      }
    }
    
    const updated = await Category.findOneAndUpdate(
      { name },
      { $set: updateData },
      { new: true }
    );
    
    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    
    // Invalidate categories cache
    clearCategoriesCache();

    // If name was updated, cascade to all products in this category and invalidate products cache
    if (newName && newName.trim() !== name) {
      await Product.updateMany({ category: name }, { $set: { category: newName.trim() } });
      clearProductsCache();
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
