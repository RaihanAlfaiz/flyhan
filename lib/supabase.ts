import { createClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!!;
const NEXT_PUBLIC_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!!;

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_KEY
);

export const getPublicUrl = (path: string) => {
  const { data } = supabase.storage.from("ImageUpload").getPublicUrl(path);
  return data.publicUrl;
};

export const uploadFile = async (file: File, folder: string = "airplanes") => {
  try {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const { data, error } = await supabase.storage
      .from("ImageUpload")
      .upload(`public/${folder}/${filename}`, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload file");
  }
};

export const deleteFile = async (path: string) => {
  try {
    const { error } = await supabase.storage.from("ImageUpload").remove([path]);
    if (error) {
      throw new Error(error.message);
    }
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete file");
  }
};

export const getPathFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/ImageUpload\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};
