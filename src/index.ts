import { JSDOM } from "jsdom";
import got from "got";
import fs from "fs";

const kenganUrl: string = "https://kenganashura.com/";

const isManga = (link: HTMLAnchorElement): boolean => {
  if (typeof link.href === "undefined") return false;
  return link.href.includes("/manga/kengan-omega"); // "/manga/kengan-ashura" for kengan-ashura
};

const isImage = (img: HTMLImageElement): boolean => {
  if (typeof img.src === "undefined") return false;
  if (img.src.includes("data/image")) return false;
  return img.src.includes("https://kenganashura.com/wp-content");
};

const getExtension = (url: string): string => {
  return url.split(/[#?]/)[0].split(".").pop()!.trim();
};

(async () => {
  const res = await got(kenganUrl);
  const linksDom = new JSDOM(res.body);
  const root = "./kengan_omega"; // root folder for the mango
  fs.mkdir(root, () => {
    console.log("Creating kengan_omega folder PogU!");
  });

  const nodes = [...linksDom.window.document.querySelectorAll("a")];
  const mangaNodes = nodes.filter(isManga);

  for (const link of mangaNodes) {
    // instead of match, use slice(28) for kengan ashura
    // this is the worst fucking hack in human history
    // as I don't know regex and will not bother to learn
    // this has been my ted talk
    const folderName = `Chapter_${link.textContent!.match(
      /(\d+(?:\.\d+)?)/
    )}`.split(",")[0];
    fs.mkdir(`${root}/${folderName}`, () =>
      console.log("Creating chapter folder:", folderName)
    );

    const chapter = await got(link.href);
    const chapterDom = new JSDOM(chapter.body);

    const imgs = [...chapterDom.window.document.querySelectorAll("img")];
    const pageImgs = imgs.filter(isImage);
    for (let i = 0; i < pageImgs.length; i++) {
      const src = pageImgs[i].src!;
      got
        .stream(src)
        .pipe(
          fs.createWriteStream(
            `${root}/${folderName}/${i}.${getExtension(src)}`
          )
        );
    }
  }
  console.log("Done!");
})();
