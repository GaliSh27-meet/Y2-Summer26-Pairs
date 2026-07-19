import os
import json
from anthropic import Anthropic
from dotenv import load_dotenv
from ics import Calendar, Event

load_dotenv()

client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

CALENDAR_TOOLS = [
    {
        "name": "add_events_to_calendar",
        "description": "Adds a list of schedule events to the calendar. Use this whenever the user provides activities to schedule.",
        "input_schema": {
            "type": "object",
            "properties": {
                "event_list": {
                    "type": "array",
                    "description": "List of events to add",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "Name of the activity"},
                            "begin": {"type": "string", "description": "ISO 8601 timestamp (e.g., '2026-07-20T09:00:00')"},
                            "end": {"type": "string", "description": "ISO 8601 timestamp (e.g., '2026-07-20T10:00:00')"},
                            "description": {"type": "string", "description": "Optional details"}
                        },
                        "required": ["name", "begin", "end"]
                    }
                }
            },
            "required": ["event_list"]
        }
    }
]

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
CRITICAL: When processing events, you MUST call the add_events_to_calendar tool immediately.
"""
    history = []

    while True:
        user_input = input('>> ')

        if user_input.lower() == 'exit':
            break

        history.append({'role': 'user', 'content': user_input})

        response = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=600,
            temperature=0.0,
            system=system_message,
            tools = CALENDAR_TOOLS, 
            messages=history
        )
        for block in response.content:
            if block.type == 'text':
                print(f'Claude: {block.text}')
            elif block.type == 'tool_use':
                if block.name == 'add_events_to_calendar':
                    args = block.input
                    cal = add_events_to_calendar(cal, args['event_list'])
                    print(f"[System: Successfully added {len(args['event_list'])} event(s) to the calendar object.]")

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
        print("Run through function succecfully")
        print(f"Adding events: {event_list}\n")
        event = Event()
        event.name = item.get('name')
        event.begin = item.get('begin')
        event.end = item.get('end')

        if 'description' in item:
            event.description = item['description']
        calendar.events.add(event)
    return calendar

run_chat()