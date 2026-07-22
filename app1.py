import os
from anthropic import Anthropic
from dotenv import load_dotenv
import json
import weasyprint

load_dotenv()

client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def export_workout_to_pdf(workout_text, filename="workout_plan.pdf"):

    html_document = f"""
    <html>
    <head>
        <style>
            @page {{
                size: A4;
                margin: 20mm;
            }}

            body {{
                font-family: Arial, sans-serif;
                color: #1e293b;
            }}

            .header {{
                background-color: #0f172a;
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
            }}

            .content {{
                white-space: pre-wrap;
                font-size: 12pt;
                line-height: 1.6;
            }}
        </style>
    </head>

    <body>

        <div class="header">
            <h1>Your Personalized Workout Plan</h1>
        </div>

        <div class="content">
            {workout_text}
        </div>

    </body>
    </html>
    """

    temp_file = "temp_workout.html"

    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(html_document)


    weasyprint.HTML(temp_file).write_pdf(filename)


    if os.path.exists(temp_file):
        os.remove(temp_file)


    print(f"PDF saved: {filename}")
def run_chat1():
    print('You: (type exit to quit)')
    system_message =system_message = """
You are Agent 1 of a workout planning web application.

Your responsibility is ONLY to collect the information needed to create a personalized workout plan.

Your job is to ask the user about:
- Their weigh.
- Their high.
- How many workout sessions they can commit to per week.
- Their goals.
- Their preferred workout location (indoor, outdoor, or both).
- Their city or location (so the weather can be checked)
- Collect the user's city or location.
- ask what time would the user like to workout and how long they would like to workout for.
- If all information has been collected, include the city in your summary so the weather can be checked.
- create the workout plan according to the collected information including the wethaer and the place prefernces (indoors,outside).
- make workout recommendations.
- plan every single dayof the workouts
-when creating the workout plan add befor tellin if outside or inside the weather in this area is good or bad for the day and if the user should workout outside or inside. 

Rules:
- Be friendly and encouraging.
- Ask clear questions one at a time when possible.
- If information is missing, politely ask for it.
- generate the final workout plan.
- Do NOT create the calendar.
- When enough information has been collected, summarize it clearly 
- Your responsibility is collecting complete and accurate information and creating the workout plan for the days the user asked for taking into consideration the weather and location preferences.
- If all information has been collected, include the city in your summary so the weather can be checked.

Response format:
1. Friendly response.
2. Ask for any missing information.
3. Summarize the collected information whenever appropriate.
4. At the end put a one sentence summary of the workouts date starting time and duraition and date.
"""
    history = []

    while True:
        user_input = input('>> ')

        if user_input.lower() == 'exit':
            break

        history.append({'role': 'user', 'content': user_input})
        # print('History:', history)
        # print('History so far:', history)
        response = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=600,
            temperature=0.7,
            system=system_message,
            messages=history
        )
        workout_text = response.content[0].text

        #print(workout_text)

        export_workout_to_pdf(workout_text)
       # print(response)
        reply = response.content[0].text
       # print(response)
        print(f'Claude: {reply}')
        
        
        list1 = []
   
        history.append({'role': 'assistant', 'content': reply})
        list1.append(reply)
        #print(list1)
        with open("workout_plan.json", "w") as file:
         Shared_data = json.dump(list1,file)

run_chat1()

