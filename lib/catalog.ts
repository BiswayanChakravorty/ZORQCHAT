export type PromptItem={id:string;title:string;category:string;model:string;prompt:string;aspectRatio:string;imageUrl:string;tags:string[]};
const groups:Record<string,string[]>= {
"Creative":["Neon Dreamscape","Glass Garden","Future Memory","Liquid Geometry","Chrome Bloom","Electric Rain","Dream Architecture","Floating Objects","Surreal Room","Paper Universe","Light Sculpture","Digital Mirage","Prism World","Synthetic Nature","Impossible Object"],
"Portrait":["Editorial Portrait","Noir Portrait","Golden Hour Face","Monochrome Studio","Cyber Portrait","Soft Film Portrait","Luxury Portrait","Street Portrait","Futuristic Headshot","Cinematic Close-Up","Minimal Portrait","Rain Portrait","Red Light Portrait","Fashion Profile","Window Light Portrait"],
"Product":["Luxury Perfume","Minimal Sneakers","Premium Watch","Skincare Campaign","Studio Beverage","Tech Product","Jewelry Campaign","Streetwear Product","Luxury Handbag","Headphones Campaign","Cosmetic Bottle","Food Hero Shot","Chair Product","Sunglasses Campaign","Smartphone Campaign"],
"Brand & Logo":["Minimal Tech Logo","Luxury Monogram","Streetwear Mark","Organic Brand Mark","Geometric Logo","Fashion Wordmark","Coffee Brand Identity","Premium Beauty Mark","Modern SaaS Logo","Bold Sports Mark"],
"Posters":["Cinema Poster","Music Poster","Fashion Poster","Event Poster","Minimal Typography","Sci-Fi Poster","Travel Poster","Product Launch Poster","Nightlife Poster","Editorial Poster"],
"Cinematic":["Rainy City","Desert Cinema","Space Station","Midnight Drive","Ocean Monument","Mountain Film Still","Future Tokyo","Dark Alley","Royal Interior","Apocalyptic Landscape"],
"Anime & Illustration":["Manga Hero","Anime School Scene","Fantasy Warrior","Cyber Anime Girl","Samurai Portrait","Magical Forest","Manga Action Panel","Anime City","Fantasy Character","Illustrated Couple"],
"3D":["Chrome Object","Clay Character","Glass Sculpture","Toy Figure","3D Product","Soft Plastic World","Metallic Icon","Miniature Room"],
"Social Media":["Viral Reel Cover","Instagram Fashion","Creator Thumbnail","Social Product Ad","Trending Portrait"],
"Experimental":["Impossible Camera","Melting Architecture"]
};
const categories=Object.entries(groups);
export const catalog:PromptItem[]=categories.flatMap(([category,titles])=>titles.map((title,index)=>{const n=Object.values(groups).flat().indexOf(title)+1;return {id:`zord-${String(n).padStart(3,"0")}`,title,category,model:"GPT Image 1.5",prompt:`Create a premium ${category.toLowerCase()} visual titled "${title}", with strong composition, refined lighting, high detail, polished commercial aesthetics, and a distinctive editorial finish. Keep the subject clear, visually balanced, and suitable for social media.`,aspectRatio:["Portrait","Product","Posters","Social Media"].includes(category)?"4:5":"1:1",imageUrl:`https://picsum.photos/seed/zord-${n}/900/1125`,tags:[category.toLowerCase().replaceAll(" ","-"),"zord","ai-art"]}}));
