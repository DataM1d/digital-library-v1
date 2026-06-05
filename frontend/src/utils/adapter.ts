import { Post, Artifact } from "../types";

const tagToLayout: Record<
  string,
  { ratio: Artifact["aspectRatio"]; weight: number }
> = {
  photography: { ratio: "landscape", weight: 4 },
  portrait: { ratio: "portrait", weight: 3 },
  design: { ratio: "square", weight: 2 },
  tech: { ratio: "landscape", weight: 3 },
};

export const mapPostToArtifact = (post: Post): Artifact => {
  let aspect: Artifact["aspectRatio"] = "portrait";
  let weight = 2;

  const matchedTag = post.tags.find((tag) => tagToLayout[tag.toLowerCase()]);

  if (matchedTag) {
    const config = tagToLayout[matchedTag.toLowerCase()];
    aspect = config.ratio;
    weight = config.weight;
  }

  if (post.content.length > 800) weight = Math.min(weight + 1, 4);

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category_name,
    imageUrl: post.image_url,
    aspectRatio: aspect,
    heightWeight: weight,
    snippet: post.meta_description || post.content.slice(0, 150) + "...",
  };
};
