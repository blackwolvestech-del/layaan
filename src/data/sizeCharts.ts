import type { ProductSizeChart } from "@/types/product";

const sizes = ["XS", "S", "M", "L", "XL"];

export const sizeChartByProductId: Readonly<Record<string, ProductSizeChart>> = {
  "beige-layered-trouser-set": {
    title: "Beige Irish Coat",
    note: "Inner is according to the bust size and it is covering waist.",
    sections: [
      { title: "Coat", columns: sizes, rows: [
        { label: "Shoulder", values: ["13.5", "14", "15", "16", "16.5"] },
        { label: "Bust", values: ["17.5", "18.5", "19.5", "20.5", "21.5"] },
        { label: "Length", values: ["27", "28", "29", "30", "31"] },
      ] },
      { title: "Trouser", columns: sizes, rows: [
        { label: "Waist", values: ["26", "28", "30", "32", "34"] },
        { label: "Length", values: ["38", "38.5", "39", "40", "41"] },
      ] },
    ],
  },
  "crimson-belted-satin-co-ord": {
    title: "Crimson Belted",
    sections: [
      { title: "Top", columns: sizes, rows: [
        { label: "Shoulder", values: ["18", "18", "18", "18", "18"] },
        { label: "Bust", values: ["18", "19", "20", "21", "22"] },
        { label: "Length", values: ["25", "26", "27", "28", "29"] },
      ] },
      { title: "Trouser", columns: sizes, rows: [
        { label: "Waist", values: ["26", "28", "30", "32", "34"] },
        { label: "Length", values: ["38", "39", "40", "40", "41"] },
      ] },
    ],
  },
  "rust-jacket-wide-leg-trousers": {
    title: "Rust Jacket",
    sections: [
      { title: "Jacket", columns: sizes, rows: [
        { label: "Shoulder", values: ["13.5", "14", "15", "16", "16.5"] },
        { label: "Bust", values: ["17.5", "18.5", "19.5", "20.5", "21.5"] },
        { label: "Length", values: ["23", "24", "25", "26", "27"] },
      ] },
      { title: "Wide-leg", columns: sizes, rows: [
        { label: "Waist", values: ["26", "28", "30", "32", "34"] },
        { label: "Length", values: ["39", "40", "41", "41", "42"] },
      ] },
    ],
  },
  "navy-wrap-trouser-suit": {
    title: "Navy Wrap",
    sections: [
      { title: "Wrap", columns: sizes, rows: [
        { label: "Shoulder", values: ["13.5", "14", "15", "16", "16.5"] },
        { label: "Bust", values: ["17.5", "18.5", "19.5", "20.5", "21.5"] },
        { label: "Length", values: ["27", "28", "29", "30", "31"] },
      ] },
      { title: "Trouser", columns: sizes, rows: [
        { label: "Waist", values: ["26", "28", "30", "32", "34"] },
        { label: "Length", values: ["38", "38.5", "39", "40", "41"] },
      ] },
    ],
  },
  "ivory-pinstripe-suit": {
    title: "Ivory Coat",
    sections: [
      { title: "Coat", columns: sizes, rows: [
        { label: "Shoulder", values: ["14", "14.5", "15", "15.5", "16"] },
        { label: "Bust", values: ["17.5", "18.5", "19.5", "20.5", "21.5"] },
        { label: "Length", values: ["27", "28", "29", "30", "31"] },
      ] },
      { title: "Trouser", columns: sizes, rows: [
        { label: "Waist", values: ["26", "28", "30", "32", "34"] },
        { label: "Length", values: ["38", "38.5", "39", "40", "41"] },
      ] },
    ],
  },
  "lime-jewelled-button-tunic-set": {
    title: "Lime Jewelled-Button Tunic & Trouser Set",
    sections: [
      { title: "Tunic", columns: sizes, rows: [
        { label: "Shoulder", values: ["13.5", "14", "15", "16", "16"] },
        { label: "Bust", values: ["17.5", "18", "19", "20", "21"] },
        { label: "Waist", values: ["16", "17", "18", "19", "20"] },
        { label: "Length", values: ["27", "28", "29", "30", "31"] },
      ] },
      { title: "Inner", columns: sizes, rows: [
        { label: "Waist", values: ["26", "28", "30", "32", "34"] },
        { label: "Hip", values: ["21", "22", "23", "24", "25"] },
        { label: "Length", values: ["38", "39", "40", "40", "41"] },
      ] },
    ],
  },
  "cream-cape-sleeve-longline-layer": {
    title: "Cream Cape-Sleeve Longline Layer",
    sections: [
      { title: "Longline layer", columns: sizes, rows: [
        { label: "Shoulder", values: ["14.5", "15", "15.5", "16", "16.5"] },
        { label: "Bust", values: ["17.5", "18.5", "19.5", "20.5", "21.5"] },
        { label: "Length", values: ["59", "60", "61", "62", "63"] },
      ] },
      { title: "Inner", columns: sizes, rows: [
        { label: "Shoulder", values: ["13.5", "14", "14.5", "15", "15.5"] },
        { label: "Bust", values: ["17.5", "18.5", "19.5", "20.5", "21.5"] },
        { label: "Length", values: ["57", "58", "59", "60", "60"] },
      ] },
    ],
  },
  "magenta-satin-button-jacket": {
    title: "Magenta Coat",
    sections: [{ title: "Coat", columns: sizes, rows: [
      { label: "Shoulder", values: ["13.5", "14", "14.5", "15", "15.5"] },
      { label: "Bust", values: ["17", "18", "19", "20", "21"] },
      { label: "Waist", values: ["16", "16.5", "17.5", "18.5", "19.5"] },
      { label: "Hip", values: ["20", "20.5", "21", "22", "23"] },
      { label: "Length", values: ["26", "26", "27", "28", "28"] },
      { label: "Sleeves length", values: ["26", "26", "26", "26", "26"] },
    ] }],
  },
  "emerald-tie-neck-maxi": {
    title: "Emerald Maxi",
    sections: [{ title: "Maxi", columns: sizes, rows: [
      { label: "Shoulder", values: ["13.5", "14", "14.5", "15", "15.5"] },
      { label: "Chest", values: ["18", "19", "20", "21", "22"] },
      { label: "Length", values: ["56", "57", "58", "59", "60"] },
      { label: "Sleeves length", values: ["21", "22", "23", "23", "23"] },
    ] }],
  },
  "black-ivory-lace-trim-set": {
    title: "Black and Ivory Lace Trim Set",
    sections: [
      { title: "Top", columns: sizes, rows: [
        { label: "Shoulder", values: ["13.5", "14", "14.5", "15", "15.5"] },
        { label: "Bust", values: ["17", "18", "19", "20", "21"] },
        { label: "Hip", values: ["21", "22", "23", "24", "25"] },
        { label: "Length", values: ["32", "32", "32", "33", "34"] },
      ] },
      { title: "Trouser", columns: sizes, rows: [
        { label: "Waist", values: ["26", "28", "30", "32", "34"] },
        { label: "Length", values: ["38", "38.5", "39", "40", "41"] },
      ] },
    ],
  },
};
