using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scheduler.Web.DataPersistence
{
    [Table("courses", Schema = "schdl")]
    public class Course
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CourseId { get; set; }

        [Required]
        [StringLength(65)]
        public string Name { get; set; }

        [Required]
        [StringLength(30)]
        public string DisplayName { get; set; }

        [StringLength(65)]
        public string Department { get; set; }

        [Required]
        public int NumberOfSections { get; set; }

        [Required]
        public int Enrollment { get; set; }

        public ICollection<PreferredCourseExpression> PreferredCourseExpressions { get; set; }
    }
}