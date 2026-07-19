import os
from anthropic import Anthropic
from dotenv import load_dotenv
from ics import Calendar, Event

load_dotenv()

client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def run_chat():
    cal = Calendar()
    print('You: (type exit to quit)')
    system_message =  """
You are Ethan, a Calander and time managment organizer .

Your job is to take pre built activities and make them into a calander.

Rules:
- Always Be as orgenised as possible.
- Never let two activities overlap eachother.

Response format:
- Start with a one-sentence summary of what the user said.
- Then give your response.
- Countinue to next step or offer more.
Take the users input and convert it into to a list of events recognised by the librery ics.
Then call the function add_events_to_calendar.
"""
    history = []

    while True:
        user_input = input('>> ')

        if user_input.lower() == 'exit':
            break

        history.append({'role': 'user', 'content': user_input})

        response = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=300,
            temperature=0.7,
            system=system_message,
            messages=history
        )

        reply = response.content[0].text
        print(f'Claude: {reply}')
        history.append({'role': 'assistant', 'content': reply})


def add_events_to_calendar(calendar, event_list):
    """
    Adds a list of events directly to an in-memory Calendar object.
    
    :param calendar: An ics.Calendar instance
    :param event_list: List of dicts containing 'name', 'begin', and 'end'
    :return: The updated Calendar instance
    """
    for item in event_list:
        event = Event()
        event.name = item.get('name')
        event.begin = item.get('begin')
        event.end = item.get('end')

        if 'description' in item:
            event.description = item['description']

run_chat()