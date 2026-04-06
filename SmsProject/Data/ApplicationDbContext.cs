using Microsoft.EntityFrameworkCore;
using SmsProject.Models;

namespace SmsProject.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<ApplicationUser> Users { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public DbSet<Contact> Contacts { get; set; } = null!;
        public DbSet<Friendship> Friendships { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Enforce unique Mobile Number and Username
            modelBuilder.Entity<ApplicationUser>()
                .HasIndex(u => u.MobileNumber)
                .IsUnique();

            modelBuilder.Entity<ApplicationUser>()
                .HasIndex(u => u.Username)
                .IsUnique();
        }
    }

    public class Friendship
    {
        public int Id { get; set; }
        public int User1Id { get; set; }
        public int User2Id { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected
    }
}
