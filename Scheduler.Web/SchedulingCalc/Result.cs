using Scheduler.Web.Models;

namespace Scheduler.Web.SchedulingCalc
{
    public class Result
    {
        public CourseSection CourseSection { get; set; }
        public Instructor Instructor { get; set; }
        public Expression Expression { get; set; }
        public Room Room { get; set; }
    }

    public enum Status
    {
        SUCCESS,
        FAILED
    }

    public class ResultStatus
    {
        public Status Status { get; set; }
        public string Message { get; set; }
        public List<Result> Results { get; set; }
    }
}
