import React from 'react';
import StaticPage from '../components/StaticPage';

const About = () => {
    return (
        <StaticPage title="About Us">
            <p>Welcome to Cravify, where technology meets taste. We are a passionate team of food enthusiasts and tech wizards dedicated to transforming the way you experience food delivery.</p>
            <p>Our journey began with a simple idea: to connect food lovers with the best local restaurants in the most seamless way possible. Today, we are proud to serve thousands of customers in Gujarat, bringing their favorite meals right to their doorstep.</p>
            <p>At Cravify, we believe that good food is an emotion. That's why we obsess over every detail of your order, from the moment you browse our app to the second you take your first bite. We partner with top-rated restaurants and rigorous hygiene standards to ensure quality and safety.</p>
            <h3 className="text-xl font-bold mt-6">Our Mission</h3>
            <p>To deliver happiness, one meal at a time.</p>
            <h3 className="text-xl font-bold mt-6">Our Vision</h3>
            <p>To be the most loved and trusted food delivery platform, known for our speed, reliability, and wide variety of choices.</p>
        </StaticPage>
    );
};

export default About;
