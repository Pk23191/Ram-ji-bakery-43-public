import { useEffect, useState } from "react";
import Seo from "../components/Seo";
import api from "../utils/api";

export default function UploadDemoPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    setUploadedUrl("");
    setErrorMessage("");
    setSelectedFile(file || null);
    setLocalPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Please select an image from your device first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setIsUploading(true);
      setErrorMessage("");

      const { data } = await api.post("/upload", formData);

      setUploadedUrl(data?.secure_url || data?.url || "");
    } catch (error) {
      setUploadedUrl("");
      setErrorMessage(error.response?.data?.message || "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Seo
        title="Upload Image"
        description="Pick an image from your device and upload it to Cloudinary through the bakery API."
        path="/upload-demo"
      />

      <section className="section-shell py-12">
        <div className="mx-auto max-w-4xl rounded-[36px] border border-white/60 bg-white/85 p-6 shadow-soft md:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-caramel">Image Upload Demo</p>
            <h1 className="mt-3 font-heading text-4xl text-cocoa">Choose an image from your device and upload it</h1>
            <p className="mt-3 text-base leading-7 text-mocha/70">
              This page accepts JPG and PNG images, sends them to <code>/api/upload</code>, and shows the Cloudinary
              result after success.
            </p>
          </div>

          <form className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]" onSubmit={handleUpload} encType="multipart/form-data">
            <div className="rounded-[28px] bg-latte/30 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-cocoa">Select Image</span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="soft-input file:mr-4 file:rounded-full file:border-0 file:bg-cocoa file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
                  onChange={handleFileChange}
                />
              </label>

              <button className="btn-primary mt-5 w-full" type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Image"}
              </button>

              {errorMessage ? (
                <div className="mt-4 rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
              ) : null}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[28px] border border-[#ead8c5] bg-vanilla/70 p-4">
                <p className="text-sm font-semibold text-cocoa">Local Preview</p>
                <div className="mt-4 flex min-h-[260px] items-center justify-center overflow-hidden rounded-[22px] bg-white">
                  {localPreview ? (
                    <img src={localPreview} alt="Selected preview" className="h-full w-full object-cover" />
                  ) : (
                    <p className="px-6 text-center text-sm text-mocha/55">Choose an image from gallery or file system.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#ead8c5] bg-vanilla/70 p-4">
                <p className="text-sm font-semibold text-cocoa">Uploaded Preview</p>
                <div className="mt-4 flex min-h-[260px] items-center justify-center overflow-hidden rounded-[22px] bg-white">
                  {uploadedUrl ? (
                    <img src={uploadedUrl} alt="Uploaded preview" className="h-full w-full object-cover" />
                  ) : (
                    <p className="px-6 text-center text-sm text-mocha/55">Uploaded Cloudinary image will appear here.</p>
                  )}
                </div>
                {uploadedUrl ? (
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-cocoa underline decoration-caramel/70 underline-offset-4"
                  >
                    Open uploaded image
                  </a>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
