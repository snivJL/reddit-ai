import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import {
  getDownloadURL,
  listAll,
  ref,
  getMetadata,
  type StorageReference,
} from "firebase/storage";
import z from "zod";
import { storage } from "./firebase";

type Bot = {
  name: string;
  personality: string;
  userId: string;
};

export const bots = [
  {
    name: "PlantPro",
    personality:
      "You are a plant specialist. You love talking about gardening, plant care, and botanical facts. Your responses should be informative and enthusiastic about plants.",
    userId: "user_2mp2c2sGAhpWcYaw0vKRxCdI1Q3",
  },
  {
    name: "TechGeek",
    personality:
      "You are a tech enthusiast. You're always excited about the latest gadgets, software updates, and tech news. Your responses should be knowledgeable and passionate about technology.",
    userId: "user_2mp3dsd1RGfwVTQZC37E757n8Vn",
  },
];

export async function generateBotPost(
  bot: Bot,
  prompt: string,
): Promise<{ title: string; content: string; mediaUrl: string | null }> {
  "use server";

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    system: bot.personality,
    prompt,
    schema: z.object({
      title: z.string().describe("The catchy post title"),
      content: z.string().describe("The content of the post"),
    }),
  });

  const mediaUrl = await getImageForBot(bot);
  return { ...object, mediaUrl };
}

export async function generateBotComment(
  bot: Bot,
  prompt: string,
): Promise<{ content: string }> {
  "use server";

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    system: bot.personality,
    prompt,
    schema: z.object({
      content: z.string().describe("The content of the comment"),
    }),
  });

  return object;
}

async function getImageForBot(bot: Bot): Promise<string | null> {
  const shouldFetchImage = Math.random() < 0.4; // 40% chance

  if (!shouldFetchImage) {
    return null;
  }

  const imagesRef = ref(storage, "media");
  const result = await listAll(imagesRef);

  if (result.items.length === 0) {
    return null;
  }

  const groupedImages = {
    plant: [] as StorageReference[],
    tech: [] as StorageReference[],
    other: [] as StorageReference[],
  };

  // Group images based on their prefixes
  result.items.forEach((item) => {
    if (item.name.startsWith("plant_")) {
      groupedImages.plant.push(item);
    } else if (item.name.startsWith("tech_")) {
      groupedImages.tech.push(item);
    } else {
      groupedImages.other.push(item);
    }
  });

  let selectedGroup: StorageReference[];
  if (bot.name === "PlantPro") {
    selectedGroup =
      groupedImages.plant.length > 0
        ? groupedImages.plant
        : groupedImages.other;
  } else if (bot.name === "TechGeek") {
    selectedGroup =
      groupedImages.tech.length > 0 ? groupedImages.tech : groupedImages.other;
  } else {
    selectedGroup =
      groupedImages.other.length > 0 ? groupedImages.other : result.items;
  }

  if (selectedGroup.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * result.items.length);
  const randomImageRef = result.items[randomIndex];

  try {
    const url = await getDownloadURL(randomImageRef!);
    console.log(url);
    return url;
  } catch (error) {
    console.error("Error fetching image URL:", error);
    return null;
  }
}
