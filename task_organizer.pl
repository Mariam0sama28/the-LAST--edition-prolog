:- dynamic task/4.
:- dynamic output/4.


max_daily_hours(14).   
task_gap(0.5).        

priority_value(high, 3).
priority_value(medium, 2).
priority_value(low, 1).


compare_tasks(Order, task(_, P1, _, _), task(_, P2, _, _)) :-
    priority_value(P1, V1),
    priority_value(P2, V2),
    (V1 > V2 -> Order = < ; Order = >).


sort_by_priority(SortedTasks) :-
    findall(task(Name, Priority, Duration, Deadline),
            task(Name, Priority, Duration, Deadline),
            Tasks),
    predsort(compare_tasks, Tasks, SortedTasks).


build_schedule(Plan) :-
    retractall(output(_,_,_,_)),
    sort_by_priority(Sorted),
    
    assign_tasks(Sorted, 1, 0).


assign_tasks([], _, _).


assign_tasks([task(N, P, D, _)|Rest], Day, UsedHours) :-
    task_gap(Gap),

    (UsedHours =:= 0 -> AddedTime = D ; AddedTime is D + Gap),
    NewUsed is UsedHours + AddedTime,
    max_daily_hours(Max),
    NewUsed =< Max,
    !, 
    assertz(output(N, P, D, Day)),
    assign_tasks(Rest, Day, NewUsed).


assign_tasks([task(N, P, D, _)|Rest], Day, _) :-
    NextDay is Day + 1,

    assertz(output(N, P, D, NextDay)),
    assign_tasks(Rest, NextDay, D).