import fetch from "node-fetch";
// const cheerio = require("cheerio")
import cheerio from "cheerio";
// const fs = require("fs")
import fs from "fs";
// const path = require("path")
import path from "path";
// const urlParser = require("url")
import urlParser from "url";

const seenUrls = {};

const getUrl = (link, host, protocol) => {
    if (link.includes("http")) {
        return link;
    } else if (link.startsWith("/")) {
        return `${protocol}//${host}${link}`;
    } else {
        return `${protocol}//${host}/${link}`;
    }
};

const crawl = async ({ url, ignore }) => {
    if (seenUrls[url]) return;
    console.log("crawling", url);
    seenUrls[url] = true;

    const { host, protocol } = urlParser.parse(url);

    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const links = $("a")
        .map((i, link) => link.attribs.href)
        .get();

    const imageUrls = $("img")
        .map((i, link) => link.attribs.src)
        .get();

    imageUrls.forEach((imageUrl) => {
        fetch(getUrl(imageUrl, host, protocol)).then((response) => {
            const filename = path.basename(imageUrl);
            const dest = fs.createWriteStream(`images/${filename}`);
            response.body.pipe(dest);
        });
    });

    links
        .filter((link) => link.includes(host) && !link.includes(ignore))
        .forEach((link) => {
            crawl({
                url: getUrl(link, host, protocol),
                ignore,
            });
        });
};

export function findImages (req, res) {
     crawl({
        url: req.body.url,
        ignore: "/search",
    });
    res.send("image downloaded sucessful")
}

// module.exports.findImages =  findImages 