const {
  PrismaClient,
} = require("@prisma/client");
const prisma = new PrismaClient();

const DATA_MAP = {
  Daging: [
    {
      title: "Daging Sapi Has Dalam",
      image: "mock_raw_beef_31.jpg",
      unit: "kg",
    },
    {
      title: "Daging Sapi Giling",
      image: "mock_raw_beef_32.jpg",
      unit: "kg",
    },
    {
      title: "Ayam Utuh Segar",
      image: "mock_raw_chicken_33.jpg",
      unit: "ekor",
    },
    {
      title: "Dada Ayam Fillet",
      image: "mock_chicken_breast_34.jpg",
      unit: "kg",
    },
    {
      title: "Sayap Ayam",
      image: "mock_chicken_wings_35.jpg",
      unit: "kg",
    },
    {
      title: "Daging Kambing Muda",
      image: "mock_raw_mutton_36.jpg",
      unit: "kg",
    },
    {
      title: "Iga Sapi",
      image: "mock_beef_ribs_37.jpg",
      unit: "kg",
    },
    {
      title: "Hati Ayam",
      image: "mock_chicken_liver_38.jpg",
      unit: "kg",
    },
    {
      title: "Buntut Sapi",
      image: "mock_oxtail_39.jpg",
      unit: "kg",
    },
    {
      title: "Daging Bebek Segar",
      image: "mock_raw_duck_40.jpg",
      unit: "kg",
    },
    {
      title: "Daging Sapi Sirloin",
      image: "mock_raw_beef_31.jpg",
      unit: "kg",
    },
    {
      title: "Daging Sapi Sandung Lamur",
      image: "mock_raw_beef_32.jpg",
      unit: "kg",
    },
    {
      title: "Paha Ayam Atas",
      image: "mock_raw_chicken_33.jpg",
      unit: "kg",
    },
    {
      title: "Paha Ayam Bawah",
      image: "mock_chicken_breast_34.jpg",
      unit: "kg",
    },
    {
      title: "Tulang Rangu Ayam",
      image: "mock_chicken_wings_35.jpg",
      unit: "kg",
    },
    {
      title: "Iga Kambing",
      image: "mock_raw_mutton_36.jpg",
      unit: "kg",
    },
    {
      title: "Tetelan Sapi",
      image: "mock_beef_ribs_37.jpg",
      unit: "kg",
    },
    {
      title: "Ampela Ayam",
      image: "mock_chicken_liver_38.jpg",
      unit: "kg",
    },
    {
      title: "Kikil Sapi",
      image: "mock_oxtail_39.jpg",
      unit: "kg",
    },
    {
      title: "Daging Bebek Peking",
      image: "mock_raw_duck_40.jpg",
      unit: "kg",
    },
  ],
  Telur: [
    {
      title: "Telur Ayam Negeri",
      image: "mock_brown_egg_41.jpg",
      unit: "kg",
    },
    {
      title: "Telur Ayam Kampung",
      image: "mock_farm_egg_42.jpg",
      unit: "butir",
    },
    {
      title: "Telur Asin Matang",
      image: "mock_salted_egg_44.jpg",
      unit: "butir",
    },
    {
      title: "Telur Puyuh",
      image: "mock_quail_egg_45.jpg",
      unit: "kg",
    },
    {
      title: "Telur Omega 3",
      image: "mock_egg_46.jpg",
      unit: "kg",
    },
    {
      title: "Telur Ayam Premium",
      image: "mock_egg_carton_47.jpg",
      unit: "papan",
    },
    {
      title: "Telur Bebek Mentah",
      image: "mock_egg_48.jpg",
      unit: "butir",
    },
    {
      title: "Telur Organik",
      image: "mock_egg_49.jpg",
      unit: "papan",
    },
    {
      title: "Telur Putih Bebas Kandang",
      image: "mock_white_egg_50.jpg",
      unit: "kg",
    },
    {
      title: "Telur Ayam Cangkang Cokelat",
      image: "mock_brown_egg_41.jpg",
      unit: "kg",
    },
    {
      title: "Telur Ayam Kampung Liar",
      image: "mock_farm_egg_42.jpg",
      unit: "butir",
    },
    {
      title: "Telur Asin Mentah",
      image: "mock_salted_egg_44.jpg",
      unit: "butir",
    },
    {
      title: "Telur Puyuh Rebus",
      image: "mock_quail_egg_45.jpg",
      unit: "pack",
    },
    {
      title: "Telur Ayam Diet",
      image: "mock_egg_46.jpg",
      unit: "kg",
    },
    {
      title: "Telur Ayam Papan",
      image: "mock_egg_carton_47.jpg",
      unit: "papan",
    },
    {
      title: "Telur Bebek Unggul",
      image: "mock_egg_48.jpg",
      unit: "butir",
    },
    {
      title: "Telur Herbal",
      image: "mock_egg_49.jpg",
      unit: "papan",
    },
    {
      title: "Telur Ayam Arab",
      image: "mock_white_egg_50.jpg",
      unit: "butir",
    },
    {
      title: "Telur Tetas Ayam",
      image: "mock_egg_46.jpg",
      unit: "butir",
    },
    {
      title: "Telur Asin Asap",
      image: "mock_salted_egg_44.jpg",
      unit: "butir",
    },
  ],
  Susu: [
    {
      title: "Susu Sapi Segar",
      image: "mock_milk_bottle_51.jpg",
      unit: "liter",
    },
    {
      title: "Susu Kambing Etawa",
      image: "mock_goat_milk_52.jpg",
      unit: "liter",
    },
    {
      title: "Yogurt Plain",
      image: "mock_yogurt_53.jpg",
      unit: "botol",
    },
    {
      title: "Keju Mozzarella Lokal",
      image: "mock_mozzarella_cheese_54.jpg",
      unit: "kg",
    },
    {
      title: "Mentega Murni",
      image: "mock_butter_55.jpg",
      unit: "pack",
    },
    {
      title: "Susu Kental Manis Asli",
      image: "mock_condensed_milk_56.jpg",
      unit: "kaleng",
    },
    {
      title: "Es Krim Susu Sapi",
      image: "mock_ice_cream_57.jpg",
      unit: "cup",
    },
    {
      title: "Kefir Susu Sapi",
      image: "mock_kefir_58.jpg",
      unit: "botol",
    },
    {
      title: "Susu Bubuk Sapi",
      image: "mock_milk_powder_59.jpg",
      unit: "kg",
    },
    {
      title: "Susu Kedelai Murni",
      image: "mock_soy_milk_60.jpg",
      unit: "liter",
    },
    {
      title: "Susu Sapi Pasteurisasi",
      image: "mock_milk_bottle_51.jpg",
      unit: "liter",
    },
    {
      title: "Susu Kambing Segar",
      image: "mock_goat_milk_52.jpg",
      unit: "liter",
    },
    {
      title: "Yogurt Stroberi",
      image: "mock_yogurt_53.jpg",
      unit: "botol",
    },
    {
      title: "Keju Cheddar Lokal",
      image: "mock_mozzarella_cheese_54.jpg",
      unit: "kg",
    },
    {
      title: "Mentega Tawar",
      image: "mock_butter_55.jpg",
      unit: "pack",
    },
    {
      title: "Susu UHT Peternak",
      image: "mock_condensed_milk_56.jpg",
      unit: "liter",
    },
    {
      title: "Es Krim Gelato Lokal",
      image: "mock_ice_cream_57.jpg",
      unit: "cup",
    },
    {
      title: "Kefir Susu Kambing",
      image: "mock_kefir_58.jpg",
      unit: "botol",
    },
    {
      title: "Kolostrum Sapi Bubuk",
      image: "mock_milk_powder_59.jpg",
      unit: "pack",
    },
    {
      title: "Susu Kedelai Hitam",
      image: "mock_soy_milk_60.jpg",
      unit: "liter",
    },
  ],
};

async function main() {
  try {
    console.log(
      "Wiping existing products and cart items...",
    );
    await prisma.cartItem.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.product.deleteMany({});
    console.log("Products cleared.");

    const sellerUsername = "aryaternak1";
    console.log(
      `Looking for seller: ${sellerUsername}`,
    );
    const seller =
      await prisma.profile.findUnique({
        where: { username: sellerUsername },
      });

    if (!seller) {
      console.error(
        `Seller '${sellerUsername}' not found!`,
      );
      return;
    }

    let productData = [];

    for (const [
      categoryName,
      items,
    ] of Object.entries(DATA_MAP)) {
      items.forEach((item) => {
        const price =
          Math.floor(
            Math.random() * 90 + 10,
          ) * 1000;
        const stock =
          Math.floor(Math.random() * 45) + 5;
        let grade = null;
        if (
          categoryName === "Daging" ||
          categoryName === "Ternak (Hidup)"
        ) {
          grade = [
            "Premium",
            "Grade A",
            "Grade B",
            "Grade C",
          ][Math.floor(Math.random() * 4)];
        }

        const img = item.image
          ? `/mocks/${item.image}`
          : null;

        productData.push({
          sellerId: seller.id,
          title: item.title,
          description: `${item.title} segar dan berkualitas. Hasil langsung dari peternakan/pertanian lokal. Produk terbaik untuk kebutuhan Anda.`,
          price,
          stock,
          category: categoryName,
          grade,
          unit: item.unit,
          imageUrls: img ? [img] : [],
        });
      });
    }

    console.log(
      `Inserting ${productData.length} diverse products...`,
    );
    await prisma.product.createMany({
      data: productData,
    });

    console.log(
      "Successfully seeded rich products!",
    );
  } catch (error) {
    console.error(
      "Error seeding products:",
      error,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main();
