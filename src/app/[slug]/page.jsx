import PublicMenuPage from "./PublicMenuPage";

export default function Page({ params }) {
  return <PublicMenuPage params={params} />;
}

// Optional: Generate metadata for SEO
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/public/restaurants/${slug}`, {
      cache: "no-store",
      timeout: 5000, // Add timeout to prevent hanging during build
    });

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
    // Don't throw - just return default metadata
  }

  return {
    title: "Restaurant Menu",
    description: "View our menu",
  };
}
