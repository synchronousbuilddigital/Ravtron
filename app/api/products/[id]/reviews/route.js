import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { verifyUser } from "@/lib/auth";
import { verifyCsrfOrigin } from "@/lib/csrf";

export async function POST(request, { params }) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { name, email, rating, comment } = body;

    if (!name || !email || !rating || !comment) {
      return NextResponse.json({ error: "All review fields are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Security check: Verify session matches email submitting the review
    if (!(await verifyUser(email))) {
      return NextResponse.json({ error: "Unauthorized access: Invalid session" }, { status: 403 });
    }

    const product = await Product.findOne({ id });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newReview = {
      name,
      email,
      rating: Number(rating),
      comment,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    if (!product.reviews) {
      product.reviews = [];
    }

    product.reviews.push(newReview);
    product.reviewsCount = product.reviews.length;

    const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));

    await product.save();

    return NextResponse.json(product);
  } catch (error) {
    console.error("POST /api/products/[id]/reviews error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to submit review" : (error.message || "Failed to submit review") },
      { status: 500 }
    );
  }
}
