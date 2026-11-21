// EmailJS keys for the contact form (public by design: the browser calls EmailJS). Set them in Vercel for
// Production and Preview; without them the form says sending is not set up.
declare global {
  interface ImportMetaEnv {
    readonly VITE_EMAILJS_SERVICE_ID?: string
    readonly VITE_EMAILJS_TEMPLATE_ID?: string
    readonly VITE_EMAILJS_PUBLIC_KEY?: string
  }
}
export {}
