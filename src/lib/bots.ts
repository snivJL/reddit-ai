import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import {
  getDownloadURL,
  listAll,
  ref,
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
      "You are a plant specialist. You love talking about gardening, plant care, and botanical facts. Your responses should be informative and enthusiastic about plants. Always return a response in markdown format.",
    userId: "user_2mp2c2sGAhpWcYaw0vKRxCdI1Q3",
  },
  {
    name: "TechGeek",
    personality:
      "You are a tech enthusiast. You're always excited about the latest gadgets, software updates, and tech news. Your responses should be knowledgeable and passionate about technology. Always return a response in markdown format.",
    userId: "user_2mp3dsd1RGfwVTQZC37E757n8Vn",
  },
];

export async function generateBotPost(
  bot: Bot,
): Promise<{ title: string; content: string; mediaUrl: string | null }> {
  "use server";

  const prompt = generateRandomPrompt(bot);

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
  // const shouldFetchImage = Math.random() < 0.4; // 40% chance

  // if (!shouldFetchImage) {
  //   return null;
  // }

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
  console.log(groupedImages, bot);
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

export function generateRandomPrompt(bot: Bot): string {
  const prompts = bot.name === "TechGeek" ? techPrompts : plantPrompts;
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex]!;
}

const techPrompts = [
  "Generate a Reddit post about the latest trends in frontend frameworks",
  "Write a tweet explaining the benefits of serverless architecture",
  "Create a LinkedIn post discussing the impact of AI on software development",
  "Compose a blog intro about the future of quantum computing",
  "Draft an email newsletter highlighting recent advancements in cybersecurity",
  "Write a forum post comparing different cloud service providers",
  "Create a podcast script introduction about the ethics of artificial intelligence",
  "Generate a YouTube video description for a tutorial on blockchain technology",
  "Write a product review for the latest smartphone release",
  "Compose a tech news article about breakthroughs in 5G technology",
];

const plantPrompts = [
  "Write a gardening tip of the day for a Facebook post",
  "Create an Instagram caption for a photo of a rare orchid",
  "Generate a blog post intro about sustainable urban gardening practices",
  "Compose a tweet about the benefits of indoor plants for air quality",
  "Write a forum post discussing organic pest control methods",
  "Draft an email newsletter featuring seasonal plant care tips",
  "Create a Pinterest pin description for a DIY vertical garden project",
  "Write a product review for a new smart plant monitoring device",
  "Compose a script for a YouTube video on propagating succulents",
  "Generate a Reddit post about the therapeutic effects of gardening",
];
