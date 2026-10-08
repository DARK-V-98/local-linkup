import { useState } from "react";
import CategoryIcon from "./CategoryIcon";
export default function ServiceImage({ imageUrl, category }: { imageUrl?: string; category: string }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  return imageUrl && failedUrl !== imageUrl ? <img src={imageUrl} alt={category + " service"} loading="lazy" className="service-photo" onError={() => setFailedUrl(imageUrl)} /> : <div className="service-image-fallback"><div className="image-orbit" /><CategoryIcon category={category} size={48} /><span>{category}</span></div>;
}
