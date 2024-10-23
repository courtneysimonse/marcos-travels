const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  };
  
  export default async (req, context) => {
    if (req.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
      };
    }
  
    const apiKey = Netlify.env.get("API_TOKEN");
    const baseUrl = "https://api.netlify.com/api/v1/forms/66ef658b908fcc0008ef9ad5/submissions";
    let submissions = [];
    let nextPage = baseUrl; // Start with the base URL
  
    try {
      // Loop to handle multiple pages
      while (nextPage) {
        const response = await fetch(nextPage, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
  
        const json = await response.json();
        submissions = submissions.concat(json);
  
        // Check if there's a next page, usually provided in the Link header
        const linkHeader = response.headers.get('Link');
        if (linkHeader) {
          const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
          nextPage = match ? match[1] : null;
        } else {
          nextPage = null; // No next page found
        }
      }
  
      const choices = submissions.map(item => item.human_fields.Choice)
        .filter(choice => choice.trim() !== "");
  
      // Count occurrences of each choice
      const choiceCount = choices.reduce((acc, choice) => {
        acc[choice] = (acc[choice] || 0) + 1;
        return acc;
      }, {});
  
      // Calculate percentages
      const totalChoices = choices.length;
      const choicePercentages = Object.fromEntries(
        Object.entries(choiceCount).map(([choice, count]) => [
          choice,
          ((count / totalChoices) * 100).toFixed(2) + "%",
        ])
      );
  
      console.log("Total choices:", totalChoices);
      console.log("Choice counts:", choiceCount);
      console.log("Choice percentages:", choicePercentages);
  
      return new Response(JSON.stringify(choices), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error(error.message);
      return new Response("error", {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  };
  