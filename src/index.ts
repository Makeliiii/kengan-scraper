import { JSDOM } from "jsdom";
import got from "got";
import fs from "fs";

const kenganUrl: string = "https://kenganashura.com/";

const isManga = (link: HTMLAnchorElement): boolean => {
  if (typeof link.href === "undefined") return false;
  return link.href.includes("/manga/kengan-ashura");
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
  fs.mkdir("./manga", () => {
    console.log("Creating folder manga folder PogU!");
  });

  const nodes = [...linksDom.window.document.querySelectorAll("a")];
  const mangaNodes = nodes.filter(isManga);

  for (const link of mangaNodes) {
    const folderName = `Chapter_${link.textContent!.slice(28)}`;
    fs.mkdir(`./manga/${folderName}`, () =>
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
            `./manga/${folderName}/${i}.${getExtension(src)}`
          )
        );
    }
  }
  console.log("Done!");
})();
