import PublicMenuPage from "./PublicMenuPage";

export default function Page({ params }) {
  return <PublicMenuPage params={params} />;
}

// Optional: Generate metadata for SEO
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/public/restaurants/${slug}`,
      { cache: "no-store" },
    );

    if (res.ok) {
      const restaurant = await res.json();
      return {
        title: `${restaurant.name} - Menu`,
        description:
          restaurant.description || `View the menu at ${restaurant.name}`,
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Restaurant Menu",
    description: "View our menu",
  };
}
