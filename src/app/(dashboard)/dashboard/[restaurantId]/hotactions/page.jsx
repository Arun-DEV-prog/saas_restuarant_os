import TableRequestsPanel from "@/components/TableRequestsPanel";
import React from "react";

const page = async ({ params }) => {
  const { restaurantId } = await params;

  return (
    <div className="col-span-1">
      <TableRequestsPanel restaurantId={restaurantId} />
    </div>
  );
};

export default page;
