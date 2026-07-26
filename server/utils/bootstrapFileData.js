const fs = require("fs/promises");
const path = require("path");

const DATA_FILES = ["products", "banners", "coupons", "orders", "reviews"];

async function bootstrapFileData() {
  const dataDir = path.join(__dirname, "..", "data");

  await Promise.all(
    DATA_FILES.map(async (name) => {
      const target = path.join(dataDir, `${name}.json`);
      const sample = path.join(dataDir, `${name}.sample.json`);

      try {
        await fs.access(target);
      } catch (error) {
        try {
          await fs.copyFile(sample, target);
          console.log(`Seeded ${name} from ${name}.sample.json`);
        } catch (sampleError) {
          if (sampleError.code !== "ENOENT") {
            throw sampleError;
          }
        }
      }
    })
  );
}

module.exports = { bootstrapFileData };
