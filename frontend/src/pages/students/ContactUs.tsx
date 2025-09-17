import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, MessageCircle, Users, Globe } from "lucide-react";

const ContactUs: React.FC = () => {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      value: "jabhijeet9274@gmail.com",
      description: "Get in touch with our support team",
      link: "mailto:jabhijeet9274@gmail.com"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      value: "+91 8108255374",
      description: "Call us during business hours",
      link: "tel:+91 8108255374"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Office Address",
      value: "Mumbai, India",
      description: "Visit our headquarters",
      link: "https://maps.app.goo.gl/5gj7tGqspu5yrcrM9"
    }
  ];

  const socialLinks = [
    {
      icon: <Globe className="h-5 w-5" />,
      name: "Facebook",
      link: "#",
      color: "hover:text-blue-600"
    },
    {
      icon: <Globe className="h-5 w-5" />,
      name: "Twitter",
      link: "#",
      color: "hover:text-blue-400"
    },
    {
      icon: <Globe className="h-5 w-5" />,
      name: "LinkedIn",
      link: "#",
      color: "hover:text-blue-700"
    }
  ];

  const supportHours = [
    { day: "Monday to Friday", hours: "9 AM – 6 PM (Local Time)" },
    { day: "Saturday", hours: "10 AM – 4 PM (Local Time)" },
    { day: "Sunday", hours: "Closed" }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-600 dark:from-gray-800 dark:to-gray-900 py-16 px-4 text-center">
        <div className="container max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-200 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            At <strong>LearnLab</strong>, your feedback, questions, and suggestions are valuable to us. 
            Whether you're a student, instructor, or admin, we're here to assist you.
          </p>
        </div>
      </div>

      {/* Contact Methods Section */}
      <section className="w-full px-4 py-16 md:py-24">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose your preferred way to reach out to our team. We're here to help!
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {contactMethods.map((method, index) => (
              <Card key={index} className="bg-white dark:bg-slate-950 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-700 mx-auto">
                    <div className="text-blue-600 dark:text-blue-100">
                      {method.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                    {method.title}
                  </h3>
                  <a 
                    href={method.link}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium block mb-2"
                  >
                    {method.value}
                  </a>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {method.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="w-full px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                Send us a Message
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Have a question or feedback? Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>
            
            <Card className="bg-white dark:bg-slate-950 border-0 shadow-lg">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="What is this regarding?"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      className="w-full min-h-[120px]"
                    />
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support Hours Section */}
      <section className="w-full px-4 py-16 md:py-24">
        <div className="container max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
                Support Hours
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our dedicated support team is available to help you during these hours.
              </p>
              
              <div className="space-y-4">
                {supportHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                      <span className="font-medium text-slate-800 dark:text-white">
                        {schedule.day}
                      </span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
                Follow Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Stay connected with us on social media for the latest updates and announcements.
              </p>
              
              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    className={`flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${social.color}`}
                  >
                    <div className="text-blue-600 dark:text-blue-400 mr-3">
                      {social.icon}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full px-4 py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find quick answers to common questions about LearnLab.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white dark:bg-slate-950 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-700">
                  <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-100" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  How do I get started?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Simply create an account, browse our courses, and start learning at your own pace.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-950 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-700">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-100" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  How can I become an instructor?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Apply through our instructor registration process and start sharing your knowledge with students.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-950 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-700">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-100" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  What if I need technical support?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Our support team is available during business hours to help with any technical issues.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
