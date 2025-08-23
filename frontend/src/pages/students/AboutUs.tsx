import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Heart, Shield, Zap } from "lucide-react";

const AboutUs: React.FC = () => {
  const values = [
    {
      icon: <Award className="h-6 w-6" />,
      title: "Excellence",
      description: "We strive for quality in everything we do, ensuring the best learning experience for our users."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Innovation",
      description: "Embracing change and finding new ways to solve challenges in education technology."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Inclusivity",
      description: "Creating a welcoming environment for everyone, regardless of background or experience level."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Integrity",
      description: "Upholding honesty and transparency in all our actions and interactions."
    }
  ];

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Personalized Learning",
      description: "Courses designed to cater to a variety of learning styles and levels."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Experienced Instructors",
      description: "A curated community of passionate and qualified educators."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Seamless Interaction",
      description: "Real-time chat, forums, and collaborative tools for better engagement."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Platform",
      description: "Data privacy and security are at the core of our values."
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-600 dark:from-gray-800 dark:to-gray-900 py-16 px-4 text-center">
        <div className="container max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About LearnLab
          </h1>
          <p className="text-xl text-gray-200 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Where we redefine the way people learn, teach, and grow. Our platform serves as a bridge between 
            knowledge seekers and passionate educators, creating a dynamic community of lifelong learners.
          </p>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <section className="w-full px-4 py-16 md:py-24">
        <div className="container max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-blue-50 dark:bg-slate-950 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-700">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-100" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Our Mission</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  At <strong>LearnLab</strong>, our mission is to empower individuals by providing access to world-class education 
                  and opportunities for personal and professional development. We believe that learning should be accessible, 
                  engaging, and tailored to individual needs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-indigo-50 dark:bg-slate-950 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-700">
                  <Award className="h-6 w-6 text-indigo-600 dark:text-indigo-100" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Our Vision</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We envision a world where knowledge knows no boundaries and everyone has the tools to unlock their full potential. 
                  By leveraging technology, we aim to create an inclusive ecosystem where students thrive, instructors excel, 
                  and learning never stops.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover what makes LearnLab the preferred choice for learners and educators worldwide.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white dark:bg-slate-950 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-700 mx-auto">
                    <div className="text-blue-600 dark:text-blue-100">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="w-full px-4 py-16 md:py-24">
        <div className="container max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
              Our Story
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              <strong>LearnLab</strong> was founded with the goal of transforming education through innovation. 
              Starting as a small initiative, we've grown into a trusted platform for learners and educators worldwide. 
              Our journey has been fueled by the stories of success and growth shared by our users.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="w-full px-4 py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do at LearnLab.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="bg-white dark:bg-slate-950 border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-700 mx-auto">
                    <div className="text-blue-600 dark:text-blue-100">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Community Section */}
      <section className="w-full px-4 py-16 md:py-24">
        <div className="container max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
              Join Our Community
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-8">
              Whether you're a student eager to learn, an instructor ready to inspire, or an admin striving for excellence, 
              <strong>LearnLab</strong> is the place for you. Together, let's shape the future of education and make 
              knowledge a resource for all.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Thank you for choosing <strong>LearnLab</strong>. Let's build a better tomorrow, one lesson at a time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
