import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { verifyAdmin } from "@/lib/auth";
import { clearProductsCache } from "@/lib/cache";
import { verifyCsrfOrigin } from "@/lib/csrf";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findOne({ id }).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const obj = { ...product };
    if (obj.name) obj.name = obj.name.replace(/ravtron/gi, "RAVTRON");
    if (obj.description) obj.description = obj.description.replace(/ravtron/gi, "RAVTRON");
    return NextResponse.json(obj);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to retrieve product" : (error.message || "Failed to retrieve product") },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const updatedProduct = await Product.findOneAndUpdate({ id }, body, {
      new: true,
      runValidators: true
    });
    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Invalidate product cache
    clearProductsCache();

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to update product" : (error.message || "Failed to update product") },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }
    await dbConnect();
    const { id } = await params;
    const deletedProduct = await Product.findOneAndDelete({ id });
    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Invalidate product cache
    clearProductsCache();

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to delete product" : (error.message || "Failed to delete product") },
      { status: 500 }
    );
  }
}
