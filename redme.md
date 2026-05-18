PRODUCT REQUIREMENTS DOCUMENT (PRD)
Product Name

Review Intelligence Dashboard

1. Objective

The goal of this product is to build a lightweight, frontend-only dashboard that visualizes customer reviews (positive and negative) from Google Sheets. The system will help business owners quickly understand customer sentiment, identify issues, and monitor trends through clear graphs and insights.

2. Problem Statement

Businesses receive customer reviews but struggle to:

Quickly understand overall sentiment
Identify patterns in feedback
Track negative experiences in real time
Convert raw review data into actionable insights

This product solves that by transforming raw review data into a structured, visual dashboard.

3. Target Users
Small business owners
Restaurant and retail managers
Marketing teams
Customer experience teams
Founders monitoring brand reputation
4. Data Source

The system uses Google Sheets as the only data source, with two separate sheets:

Positive Reviews
Negative Reviews

Each review includes:

Customer Name
Review Text
Rating
Date
Sentiment

Google Apps Script acts as a bridge to expose this data as an API for the frontend.

5. Product Scope

This product is a read-only analytics dashboard.
It does not allow editing or writing data.

The focus is:

Visualization
Insights
Monitoring
6. Core Features
6.1 Dashboard Overview

A summary section at the top showing:

Business name
Total number of reviews
Total positive reviews
Total negative reviews
Sentiment ratio (percentage of positive vs negative reviews)

Purpose: Provide a quick understanding of overall business performance.

6.2 Visual Analytics (Graphs Section)
Sentiment Distribution

A pie chart showing the proportion of positive vs negative reviews.
Purpose: Instant overview of customer satisfaction.

Review Trends Over Time

A line chart displaying review counts over time, separated into positive and negative.
Purpose: Identify patterns, spikes, or drops in sentiment.

Rating Distribution

A bar chart showing the number of reviews for each rating (1 to 5 stars).
Purpose: Understand how ratings are distributed across customers.

Keyword Insights

A section highlighting commonly used words in:

Positive reviews
Negative reviews

Purpose: Identify what customers frequently appreciate or complain about.

6.3 Review Explorer

A detailed section displaying individual reviews.

Layout:

Two columns:
Positive Reviews
Negative Reviews

Each review displays:

Customer name
Review text
Rating
Date

Features:

Scrollable lists
Sorting (by date or rating)
Search functionality

Purpose: Allow deep inspection of feedback.

6.4 Smart Insights

Automatically generated insights based on data patterns.

Examples:

High percentage of positive reviews indicates strong performance
Sudden increase in negative reviews indicates a potential issue
Frequently mentioned keywords highlight strengths or weaknesses

Purpose: Convert raw data into meaningful conclusions.

6.5 Alerts System

Highlights unusual or critical situations such as:

Sudden spike in negative reviews
Drop in average rating
Increased complaints within a short time

Purpose: Help businesses react quickly to problems.

7. User Experience Requirements

The interface should be:

Clean and minimal
Easy to understand within a few seconds
Visually structured with clear sections
Responsive across desktop and mobile devices

Navigation should be simple, with all key information visible without deep interaction.

8. Design Requirements
Use a modern dashboard style similar to analytics tools
Color coding:
Green for positive
Red for negative
Neutral colors for layout
Use cards, spacing, and hierarchy for clarity
Graphs should be clear and readable
9. Functional Requirements
Fetch data from API on page load
Render all sections dynamically
Handle empty or missing data gracefully
Display accurate counts and analytics
Load within acceptable time limits
10. Non-Functional Requirements
Fully frontend-based (no traditional backend server)
Hosted on static hosting (GitHub Pages)
Lightweight and fast
Scalable for moderate data size (up to a few thousand reviews)
11. Constraints
Only Google Sheets as database
Only Google Apps Script as API
Only GitHub Pages for hosting
No authentication layer
Public access dashboard
12. Risks and Limitations
Data is publicly accessible
API limits from Google Apps Script
No real-time updates (requires refresh)
Limited scalability compared to full backend systems
13. Success Metrics
Dashboard loads successfully without errors
Data displayed matches source data
Users can understand sentiment within seconds
Graphs render correctly and clearly
Insights provide meaningful value
14. Future Enhancements
Export reports (PDF or CSV)
Multi-business dashboard support
Real-time alerts via messaging platforms
AI-based sentiment summaries
Advanced filtering and segmentation
15. Product Vision

To provide a simple yet powerful tool that transforms raw customer reviews into clear, actionable business insights without requiring complex infrastructure or technical expertise.