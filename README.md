# AI-Powered Debate Simulator

This is an advanced web application built with Angular and the Google Gemini API. It provides two distinct modes: a professional media platform for analyzing debate topics and a gamified debate simulator for public and educational use.

## Features

- **Dual-Mode Interface**: Easily switch between a professional analysis tool and an interactive game.
- **Media Platform**:
  - **In-Depth Topic Analysis**: Input any debate topic to receive a comprehensive breakdown, including topic context, an engagement score, key arguments (for and against), and recommended guest personas.
  - **Trending Topic Discovery**: Uses Google Search grounding to discover and suggest current, trending debate topics.
  - **Visualized Personas**: Generated personas include representative images to make them more tangible.
- **Debate Game**:
  - **AI Opponents**: Choose from a variety of AI personas, each with a unique debating style.
  - **Interactive Chat**: Engage in a turn-by-turn debate with the AI.
  - **Voice-Enabled Chat**: Use your microphone to speak your arguments (Speech-to-Text) and hear the AI's responses (Text-to-Speech).
  - **AI Judging**: At the end of the debate, an impartial AI judge scores the performance of both you and the AI opponent and declares a winner.
  - **Leaderboard**: Your victories and scores are saved to a local leaderboard to track your progress.
- **Modern Tech Stack**:
  - **Angular**: A powerful, modern frontend framework for building single-page applications.
  - **Gemini API**: Leverages Google's state-of-the-art generative AI for analysis, chat, and judging.
  - **Tailwind CSS**: For a utility-first, responsive, and modern design.
  - **Zoneless**: Utilizes Angular's modern zoneless change detection for improved performance.

## Getting Started

To run this application, you need to configure your Google Gemini API key.

### Prerequisites

-   A modern web browser like Chrome, Firefox, or Edge.
-   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Configuration

The application requires the Gemini API key to be available as an environment variable named `API_KEY`.

1.  **Create an Environment File**: While this platform manages environment variables through a dedicated secrets panel, for local development you would typically create a `.env` file in the project's root directory.

2.  **Set the API Key**: Add your API key to the environment configuration.

    **.env.example**
    ```
    # Replace YOUR_GEMINI_API_KEY_HERE with your actual key
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

### Running the Application

In the development environment where this app is hosted, once the `API_KEY` is correctly set in the environment secrets, the application will build and run automatically. No further steps are needed.

## Project Structure

-   `index.html`: The main HTML file, which includes Tailwind CSS and sets up the application root.
-   `index.tsx`: The entry point for bootstrapping the Angular application.
-   `src/`: Contains all the Angular application source code.
    -   `app.component.ts`: The root component of the application.
    -   `components/`: Contains all reusable Angular components.
        -   `media-platform/`: The component for the professional analysis tool.
        -   `debate-game/`: The component for the interactive debate game.
    -   `services/`:
        -   `gemini.service.ts`: A dedicated service for all interactions with the Google Gemini API.
