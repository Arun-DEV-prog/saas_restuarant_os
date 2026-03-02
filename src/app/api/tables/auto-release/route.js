export async function autoReleaseRoute() {
  try {
    const tblColl = await getCollection("tables");
    const result = await tblColl.updateMany(
      { status: "reserved", reservationExpiry: { $lt: new Date() } },
      {
        $set: { status: "available" },
        $unset: {
          reservedAt: "",
          reservationExpiry: "",
          persons: "",
          orderId: "",
        },
      },
    );
    console.log(`[auto-release] freed ${result.modifiedCount} tables`);
    return NextResponse.json({
      success: true,
      released: result.modifiedCount,
      at: new Date(),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
