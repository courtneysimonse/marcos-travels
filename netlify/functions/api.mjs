export default async (req, context) => {
    const apiKey = Netlify.env.get("API_TOKEN");
    const url = "https://api.netlify.com/api/v1/forms/66ef658b908fcc0008ef9ad5/submissions";
    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
    
        const json = await response.json();
        console.log(json);
        const choices = json.map(item => item.human_fields.Choice)
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
            ((count / totalChoices) * 100).toFixed(2) + "%"
            ])
        );
        
        console.log("Total choices:", totalChoices);
        console.log("Choice counts:", choiceCount);
        console.log("Choice percentages:", choicePercentages);


        return new Response(JSON.stringify(choices));
    } catch (error) {
        console.error(error.message);
        return new Response("error");
    }
  };
  