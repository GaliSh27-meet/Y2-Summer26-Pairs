print("There are two agents. The first one builds you a workout plan. The second one helps you orgenise activities and workouts.")
print(" Type 1 to choos the first agent and 2 to choose the second one. To end program type exit.")

while True:
    user_input = input("Which Agent do you wanna use?")
    if user_input == "1":
        from app1 import run_chat1
    elif user_input == "2":
        from app2 import run_chat2
    elif user_input == "exit":
        print("Program ended")
        break