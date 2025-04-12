using System.ComponentModel.DataAnnotations;
using Scheduler.Web.DataPersistence;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scheduler.Web.DataPersistence
{
    [Table("preferredCourseExpressions", Schema = "schdl")]
    public class PreferredCourseExpression
    {
        [Key, Column(Order = 0)]
        public int CourseId { get; set; }

        [ForeignKey("CourseId")]
        public Course Course { get; set; }

        [Key, Column(Order = 1)]
        public int ExpressionId { get; set; }

        [ForeignKey("ExpressionId")]
        public Expression Expression { get; set; }
    }
}