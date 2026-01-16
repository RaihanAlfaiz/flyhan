"use server";

export async function submitContact(prevState: any, formData: FormData) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const name = formData.get("name");
  const email = formData.get("email");
  const subject = formData.get("subject");
  const message = formData.get("message");

  // Log to console (in real app, send email or save to DB)
  console.log("New Contact Form Submission:", {
    name,
    email,
    subject,
    message,
  });

  return {
    success: true,
    message: "Thank you! Your message has been sent successfully.",
  };
}
