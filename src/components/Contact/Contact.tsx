import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from 'emailjs-com';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [lastSent, setLastSent] = useState<Date | null>(null);

  const handleSend = () => {
    const now = new Date();
    if (lastSent && (now.getTime() - lastSent.getTime()) < 3600000) { // 1 hour in milliseconds
      const timeLeft = Math.ceil((3600000 - (now.getTime() - lastSent.getTime())) / 60000); // time left in minutes
      toast.error(`You can send another email in ${timeLeft} minutes.`);
      return;
    }

    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID')
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        toast.success('Email sent successfully!');
        setLastSent(new Date());
      }, (err) => {
        console.log('FAILED...', err);
        toast.error('Failed to send email.');
      });
  };

  return (
    <div id="contact" className="min-h-screen flex flex-col items-center justify-center py-16 px-4">
      <h2 className="text-3xl font-bold text-white mb-8">Contact Me</h2>
      <form className="w-full max-w-lg bg-[#1E2328] p-8 rounded-lg shadow-lg">
        <div className="mb-6">
          <label className="block text-[#A09B8C] text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="w-full px-3 py-2 text-[#C8AA6E] bg-[#091428] border border-[#C8AA6E] rounded focus:outline-none focus:ring-2 focus:ring-[#C8AA6E] appearance-none"
            id="name"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="mb-6">
          <label className="block text-[#A09B8C] text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="w-full px-3 py-2 text-[#C8AA6E] bg-[#091428] border border-[#C8AA6E] rounded focus:outline-none focus:ring-2 focus:ring-[#C8AA6E] appearance-none"
            id="email"
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="mb-6">
          <label className="block text-[#A09B8C] text-sm font-bold mb-2" htmlFor="message">
            Message
          </label>
          <textarea
            className="w-full px-3 py-2 text-[#C8AA6E] bg-[#091428] border border-[#C8AA6E] rounded focus:outline-none focus:ring-2 focus:ring-[#C8AA6E] appearance-none"
            id="message"
            rows={5}
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <div className="flex justify-center">
          <button
            className="relative z-0 flex items-center gap-2 overflow-hidden rounded-lg border-[1px] border-[#044e48] px-4 py-2 font-semibold uppercase text-[#0AC8B9] transition-all duration-500
            before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-[#0AC8B9] before:transition-transform before:duration-1000 before:content-['']
            hover:scale-105 hover:text-neutral-900 hover:before:translate-x-[0%] hover:before:translate-y-[0%] active:scale-95"
            type="button"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}