using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmsProject.Models
{
    public class ApplicationUser
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(10, MinimumLength = 10)]
        [RegularExpression(@"^[0-9]*$")]
        public string MobileNumber { get; set; } = string.Empty;

        // Personal Details
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? MaritalStatus { get; set; }
        public string? Hobbies { get; set; }

        // Professional Details
        public string? Qualification { get; set; }
        public string? School { get; set; }
        public string? College { get; set; }
        public string? WorkStatus { get; set; }
        public string? CompanyName { get; set; }
        public string? JobTitle { get; set; }

        public bool IsPremium { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [NotMapped]
        public string Mobile => MobileNumber;
    }
}
