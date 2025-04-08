using Microsoft.AspNetCore.Mvc;
using Models = Scheduler.Web.Models;
using Scheduler.Web.SchedulingCalc;
using Scheduler.Web.DataPersistence;

namespace Scheduler.Web.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulerController : ControllerBase
    {
        private readonly ILogger<SchedulerController> _logger;
        private readonly ScheduleSolver solver;
        private readonly SchedulerRepository _repository;

        public SchedulerController(SchedulerRepository repository, ILogger<SchedulerController> logger)
        {
            _logger = logger;
            solver = new ScheduleSolver();
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetPageData(int page = 1, int pageSize = 15)
        {
            try
            {
                var logData = await this._repository.FetchEventLogPageAsync(page, pageSize);
                var pageNums = await this._repository.GetTotalPagesAsync(pageSize);
                return Ok(new { LogData = logData, PageNums = pageNums });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> SubmitSettings([FromBody] JsonInput data)
        {
            var instructorEventLogs = await this._repository.UpsertInstructorsAsync(data.Instructors);
            var (rooms, roomsEventLogs) = await this._repository.UpsertRoomsAsync(data.Rooms);

            List<Models.CourseSection> courseSections = CreateCourseSections(data.Courses);
            List<Models.Expression> expressions = CreateExpressionsFromJsonInput(data);

            var expressionIndexToExpressionId = await this._repository.InsertExpressionsAsync(expressions);
            var courseEventLogs = await this._repository.InsertCoursesAsync(data.Courses, expressionIndexToExpressionId);

            await this._repository.InsertEventLogsAsync(instructorEventLogs.Concat(roomsEventLogs).ToList().Concat(courseEventLogs));
            var schedulerResult = this.solver.Solve(data.Instructors, expressions, data.Rooms, courseSections);
            await this._repository.InsertCompletedScheduleRunAsync(schedulerResult.Results.Count > 0, schedulerResult.Message ?? "");
            
            return new JsonResult(schedulerResult);
        }

        private List<Models.Expression> CreateExpressionsFromJsonInput(JsonInput input)
        {
            List<Models.Expression> expressions = new List<Models.Expression>();
            for (int i = 0; i < input.Timeslots.Count(); i++)
            {
                var possExpression = input.Timeslots[i];
                List<Models.DaySlot> daySlots = new List<Models.DaySlot>();
                foreach (var item in possExpression)
                {
                    var startAndEnds = item.Value;

                    var timesOnly = startAndEnds
                        .Select(s => new Models.TimeSlot { Start = TimeOnly.Parse(s["start"]), End = TimeOnly.Parse(s["end"]) })
                        .ToList();

                    var day = item.Key;
                    switch (day)
                    {
                        case "Monday":
                            daySlots.Add(new Models.DaySlot
                            {
                                Day = Models.Day.MONDAY,
                                TimeSlots = timesOnly,
                            });
                            break;
                        case "Tuesday":
                            daySlots.Add(new Models.DaySlot
                            {
                                Day = Models.Day.TUESDAY,
                                TimeSlots = timesOnly,
                            });
                            break;
                        case "Wednesday":
                            daySlots.Add(new Models.DaySlot
                            {
                                Day = Models.Day.WEDNESDAY,
                                TimeSlots = timesOnly,
                            });
                            break;
                        case "Thursday":
                            daySlots.Add(new Models.DaySlot
                            {
                                Day = Models.Day.THURSDAY,
                                TimeSlots = timesOnly,
                            });
                            break;
                        case "Friday":
                            daySlots.Add(new Models.DaySlot
                            {
                                Day = Models.Day.FRIDAY,
                                TimeSlots = timesOnly,
                            });
                            break;
                        case "Saturday":
                            daySlots.Add(new Models.DaySlot
                            {
                                Day = Models.Day.SATURDAY,
                                TimeSlots = timesOnly,
                            });
                            break;
                        case "Sunday":
                            daySlots.Add(new Models.DaySlot
                            {
                                Day = Models.Day.SUNDAY,
                                TimeSlots = timesOnly,
                            });
                            break;
                        default:
                            throw new Exception("Unrecognized day of week");
                    }
                }
                expressions.Add(new Models.Expression { Slots = daySlots });
            }
            return expressions;
        }

        protected List<Models.CourseSection> CreateCourseSections(List<Models.Course> courses)
        {
            return courses.SelectMany(c =>
            {
                var sections = new List<Models.CourseSection>();
                for (int i = 1; i <= c.NumberOfSections; i++)
                {
                    sections.Add(new Models.CourseSection
                    {
                        Name = c.Name,
                        DisplayName = c.DisplayName,
                        StudentEnrollment = c.Enrollment,
                        PreferredTimeslots = c.PreferredTimeslots,
                        SectionNum = i,
                        Department = c.Department,
                    });
                }
                return sections;
            }).ToList();
        }
    }

    public class JsonInput
    {
        public List<Models.Instructor> Instructors { get; set; }
        public List<Models.Room> Rooms { get; set; }
        public List<Models.Course> Courses { get; set; }
        public List<Dictionary<string, List<Dictionary<string, string>>>> Timeslots { get; set; }
    }
}
