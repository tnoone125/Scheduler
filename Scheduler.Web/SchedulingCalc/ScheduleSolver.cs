using Scheduler.Web.Models;
using Google.OrTools.Sat;

namespace Scheduler.Web.SchedulingCalc
{
    public class ScheduleSolver
    {
        public ResultStatus Solve(List<Instructor> instructors, List<Expression> expressions, List<Room> rooms, List<CourseSection> courses)
        {
            var (isValid, message) = IsValid(instructors, expressions, rooms, courses);

            if (!isValid)
            {
                return new ResultStatus
                {
                    Status = Status.FAILED,
                    Message = message,
                };
            }
            CpModel model = new CpModel();

            // Define the variable x[c, i, r, e] (binary decision variable)
            // s[c, i, r, e] = 1 if course c is assigned to expression (timeslot) e with instructor i and room r
            Dictionary<(int c, int i, int r, int e), BoolVar> assignments = new Dictionary<(int, int, int, int), BoolVar>();
            for (int c = 0; c < courses.Count(); c++)
            {
                for (int i = 0; i < instructors.Count(); i++)
                {
                    for (int r = 0; r < rooms.Count(); r++)
                    {
                        for (int e = 0; e < expressions.Count(); e++)
                        {
                            assignments[(c, i, r, e)] = model.NewBoolVar($"s_{c}_{i}_{r}_{e}");
                        }
                    }
                }
            }

            // Constraint: Each course is assigned exactly one instructor, room, and timeslot
            for (int c = 0; c < courses.Count(); c++)
            {
                LinearExpr sum = LinearExpr.Constant(0);
                for (int i = 0; i < instructors.Count(); i++)
                {
                    for (int r = 0; r < rooms.Count(); r++)
                    {
                        for (int e = 0; e < expressions.Count(); e++)
                        {
                            sum += assignments[(c, i, r, e)];
                        }
                    }
                }

                // Add the constraint: Each course must be assigned exactly once
                model.Add(sum == 1);
            }

            // Constraint: no course should be assigned to a room with not enough capacity.
            for (int c = 0; c < courses.Count(); c++)
            {
                LinearExpr doNotAssign = assignments.Where(kv => kv.Key.c == c && rooms[kv.Key.r].StudentCapacity < courses[c].StudentEnrollment)
                                                    .Select(kv => kv.Value)
                                                    .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + v);

                model.Add(doNotAssign == 0);
            }

            // Constraint: No instructor is assigned more than their allotted limit
            for (int i = 0; i < instructors.Count(); i++)
            {
                var limit = instructors[i].CourseMax;
                if (limit.HasValue)
                {
                    LinearExpr assigns = assignments.Where(kv => kv.Key.i == i)
                                                    .Select(kv => kv.Value)
                                                    .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + v);
                    model.Add(assigns <= limit.Value);
                }
            }

            // Constraint: No instructor is assigned under their allotted minimum
            for (int i = 0; i < instructors.Count(); i++)
            {
                var minimum = instructors[i].CourseMin;
                if (minimum.HasValue)
                {
                    LinearExpr assigns = assignments.Where(kv => kv.Key.i == i)
                                                    .Select(kv => kv.Value)
                                                    .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + v);
                    model.Add(assigns >= minimum.Value);
                }
            }

            // Constraint: at each timeslot and room pair, only one course is assigned.
            for (int e = 0; e < expressions.Count(); e++)
            { 
                for (int r = 0; r < rooms.Count(); r++)
                {
                    LinearExpr vs = assignments.Where(kv => kv.Key.r == r && kv.Key.e == e)
                                                      .Select(kv => kv.Value)
                                                      .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + v);

                    model.Add(vs <= 1);
                }
            }

            // Constraint: No instructor should be assigned to multiple courses at one time.
            for (int i = 0; i < instructors.Count(); i++)
            {
                for (int e = 0; e < expressions.Count(); e++)
                {
                    LinearExpr vs = assignments.Where(kv => kv.Key.i == i && kv.Key.e == e)
                                                  .Select(kv => kv.Value)
                                                  .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + v);

                    model.Add(vs <= 1);
                }
            }

            // Constraint: Instructor should only be assigned to a course in his/her department
            for (int i = 0; i < instructors.Count(); i++)
            {
                LinearExpr vs = assignments.Where(kv => kv.Key.i == i && courses[kv.Key.c].Department != instructors[i].Department)
                    .Select(kv => kv.Value)
                    .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + v);

                model.Add(vs == 0);
            }

            // Constraint: No instructor should be assigned to two expressions that are conflicting
            List<HashSet<int>> conflictingExpressions = ExpressionConflctFinder.FindConflictGroups(expressions);
            for (int i = 0; i < courses.Count(); i++)
            {
                foreach (var set in conflictingExpressions)
                {
                    LinearExpr vs = assignments.Where(kv => kv.Key.i == i && set.Contains(kv.Key.e))
                        .Select(kv => kv.Value)
                        .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + v);
                    model.Add(vs <= 1);
                }
            }

            // Constraint: No room should be assigned to two expressions that are conflicting.
            for (int r = 0; r < rooms.Count(); r++)
            {
                foreach (var set in conflictingExpressions)
                {
                    LinearExpr vs = assignments.Where(kv => kv.Key.r == r && set.Contains(kv.Key.e))
                        .Select(kv => kv.Value)
                        .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + v);
                    model.Add(vs <= 1);
                }
            }

            // Objective Function: Penalize when a room is assigned to a department that is not in
            // the preferred list.
            LinearExpr obj = LinearExpr.Constant(0);
            for (int r = 0; r < rooms.Count(); r++)
            {
                var room = rooms[r];

                for (int c = 0; c < courses.Count(); c++)
                {
                    if (!room.PermittedDepartments.Contains(courses[c].Department))
                    {
                        obj += assignments.Where(kv => kv.Key.r == r && kv.Key.c == c)
                            .Select(kv => (LinearExpr)kv.Value)
                            .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + 3 * v);
                    }
                }
            }

            // Penalize when a course is not assigned to an expression in its preferred list.
            for (int e = 0; e < expressions.Count(); e++)
            {
                for (int c = 0; c < courses.Count(); c++)
                {
                    if (!courses[c].PreferredTimeslots.Contains(e + 1))
                    {
                        obj += assignments.Where(kv => kv.Key.c == c && kv.Key.e == e)
                            .Select(kv => (LinearExpr)kv.Value)
                            .Aggregate(LinearExpr.Constant(0), (acc, v) => acc + 2 * v);
                    }
                }
            }

            model.Minimize(obj);

            // Create the solver and solve
            CpSolver solver = new CpSolver();
            CpSolverStatus status = solver.Solve(model);

            if (status == CpSolverStatus.Optimal || status == CpSolverStatus.Feasible)
            {
                List<Result> results = new List<Result>();
                for (int c = 0; c < courses.Count; c++)
                {
                    var assignment = assignments.Where(a => a.Key.c == c && solver.BooleanValue(a.Value)).Single();
                    var i = assignment.Key.i;
                    var e = assignment.Key.e;
                    var r = assignment.Key.r;

                    results.Add(new Result
                    {
                        CourseSection = courses[c],
                        Room = rooms[r],
                        Instructor = instructors[i],
                        Expression = expressions[e]
                    });
                }
                return new ResultStatus
                {
                    Results = results,
                    Status = Status.SUCCESS,
                };
            }
            else
            {
                return new ResultStatus
                {
                    Status = Status.FAILED,
                    Message = "No feasible solution found."
                };
            }
        }

        // Returns true if initial validity checks over the inputs seem to show valid constraints
        // (primarily enough rooms, timeslots, and instructors for the given courses)
        protected (bool, string) IsValid(List<Instructor> instructors, List<Expression> expressions, List<Room> rooms, List<CourseSection> courses)
        {
            // Check that the total number of rooms and timeslots are sufficient
            var roomSlotCombos = rooms.Count() * expressions.Count();
            if (courses.Count > roomSlotCombos)
            {
                return (false, "Not enough rooms and timeslots");
            }

            // Find if there is any course that exceeds the capacity of all the rooms
            var cannotFitCourse = courses.Any(c => rooms.All(r => r.StudentCapacity < c.StudentEnrollment));
            if (cannotFitCourse)
            {
                return (false, "There is a course with enrollment over all rooms' capacities");
            }

            if (instructors.All(i => i.CourseMax.HasValue))
            {
                var totalInstructorSlots = instructors.Select(i => i.CourseMax.Value).Sum();
                if (totalInstructorSlots < courses.Count)
                {
                    return (false, "Too many courses given the limits for each instructor");
                }
            }

            var minimumInstructorSlots = instructors.Select(i => i.CourseMin.HasValue ? i.CourseMin.Value : 0).Sum();
            if (courses.Count < minimumInstructorSlots)
            {
                return (false, "There are not enough courses to fill the quotas for some instructors.");
            }

            return (true, "");
        }
    }
}
