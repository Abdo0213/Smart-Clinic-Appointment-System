using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Admin.Application.Interfaces;
using Admin.Infrastructure.Data;
using Admin.Domain.Entities;
using Admin.Application.DTOs;

namespace Admin.Api.Controllers;

[ApiController]
[Route("admin")]
// [Authorize(Roles = "ADMIN")] // We will uncomment this when we set up JWT auth
public class AdminController : ControllerBase
{
    private readonly IAppointmentApiClient _appointmentApiClient;
    private readonly IBillingApiClient _billingApiClient;
    private readonly AdminDbContext _dbContext;
    private readonly IReportStorageService _reportStorage;

    public AdminController(
        IAppointmentApiClient appointmentApiClient, 
        IBillingApiClient billingApiClient,
        AdminDbContext dbContext,
        IReportStorageService reportStorage)
    {
        _appointmentApiClient = appointmentApiClient;
        _billingApiClient = billingApiClient;
        _dbContext = dbContext;
        _reportStorage = reportStorage;
    }
    // GET /admin/users
    [HttpGet("users")]
    public IActionResult GetUsers([FromQuery] string? role, [FromQuery] bool? isActive, [FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        // TODO: Call Auth Service to get users
        return Ok(new { message = "Users list placeholder" });
    }

    // POST /admin/users/{userId}/role
    [HttpPost("users/{userId}/role")]
    public IActionResult ReassignRole(string userId, [FromBody] RoleUpdateRequest request)
    {
        // TODO: Call Auth Service to update user role
        return Ok(new { userId, role = request.Role, updatedAt = DateTime.UtcNow });
    }

    // POST /admin/audit-log
    // Called internally by other microservices to log PHI access
    [HttpPost("audit-log")]
    public async Task<IActionResult> CreateAuditLog([FromBody] AuditLogCreateDto dto)
    {
        var auditLog = new AuditLog
        {
            ActorId = dto.ActorId,
            ActorRole = dto.ActorRole,
            Service = dto.Service,
            Action = dto.Action,
            EntityType = dto.EntityType,
            EntityId = dto.EntityId,
            IpAddress = dto.IpAddress,
            OccurredAt = DateTime.UtcNow
        };

        _dbContext.AuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync();

        return Created("", auditLog);
    }

    // GET /admin/audit-log
    [HttpGet("audit-log")]
    public async Task<IActionResult> GetAuditLog([FromQuery] string? actorId, [FromQuery] string? entityType, [FromQuery] string? action, [FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        var query = _dbContext.AuditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(actorId)) query = query.Where(a => a.ActorId == actorId);
        if (!string.IsNullOrEmpty(entityType)) query = query.Where(a => a.EntityType == entityType);
        if (!string.IsNullOrEmpty(action)) query = query.Where(a => a.Action == action);

        var totalElements = await query.CountAsync();
        
        var logs = await query
            .OrderByDescending(a => a.OccurredAt)
            .Skip(page * size)
            .Take(size)
            .ToListAsync();

        return Ok(new
        {
            content = logs,
            page,
            size,
            totalElements,
            totalPages = (int)Math.Ceiling(totalElements / (double)size)
        });
    }

    // GET /admin/reports/appointments
    [HttpGet("reports/appointments")]
    public async Task<IActionResult> GetAppointmentsReport([FromQuery] string? dateFrom, [FromQuery] string? dateTo, [FromQuery] string? doctorId, [FromQuery] string granularity = "daily")
    {
        var response = await _appointmentApiClient.GetAppointmentsAsync(dateFrom, dateTo, doctorId);
        var appointments = response?.Content ?? new List<AppointmentDto>();

        var total = appointments.Count;
        var completed = appointments.Count(a => a.Status == "COMPLETED");
        var cancelled = appointments.Count(a => a.Status == "CANCELLED");
        var noShow = appointments.Count(a => a.Status == "NO_SHOW");

        var byDoctor = appointments.GroupBy(a => a.DoctorId).Select(g => new DoctorUtilization
        {
            DoctorId = g.Key,
            Total = g.Count(),
            UtilizationPercent = g.Count() > 0 && total > 0 ? Math.Round((double)g.Count() / total * 100, 2) : 0
        }).ToList();

        var report = new AppointmentsReportResponse
        {
            Period = new PeriodDto { From = dateFrom ?? "all time", To = dateTo ?? "all time" },
            TotalAppointments = total,
            Completed = completed,
            Cancelled = cancelled,
            NoShow = noShow,
            ByDoctor = byDoctor
        };

        return Ok(report);
    }

    // GET /admin/reports/revenue
    [HttpGet("reports/revenue")]
    public async Task<IActionResult> GetRevenueReport([FromQuery] string? dateFrom, [FromQuery] string? dateTo)
    {
        var response = await _billingApiClient.GetInvoicesAsync(dateFrom, dateTo);
        var invoices = response?.Content ?? new List<InvoiceDto>();

        var report = new RevenueReportResponse
        {
            Period = new PeriodDto { From = dateFrom ?? "all time", To = dateTo ?? "all time" },
            TotalBilled = invoices.Sum(i => i.TotalAmount),
            TotalCollected = invoices.Where(i => i.Status == "PAID").Sum(i => i.TotalAmount),
            TotalWaived = invoices.Where(i => i.Status == "WAIVED").Sum(i => i.TotalAmount),
            Pending = invoices.Where(i => i.Status == "PENDING").Sum(i => i.TotalAmount)
        };

        return Ok(report);
    }

    // GET /admin/reports/no-show-rate
    [HttpGet("reports/no-show-rate")]
    public async Task<IActionResult> GetNoShowRate([FromQuery] string? dateFrom, [FromQuery] string? dateTo, [FromQuery] string? doctorId)
    {
        var response = await _appointmentApiClient.GetAppointmentsAsync(dateFrom, dateTo, doctorId);
        var appointments = response?.Content ?? new List<AppointmentDto>();

        var total = appointments.Count;
        var noShow = appointments.Count(a => a.Status == "NO_SHOW");
        var rate = total > 0 ? Math.Round((double)noShow / total * 100, 2) : 0;

        return Ok(new { noShowRate = rate, noShowCount = noShow, totalAppointments = total });
    }

    // GET /admin/reports/export
    [HttpGet("reports/export")]
    public async Task<IActionResult> ExportReport([FromQuery] string reportType, [FromQuery] string? dateFrom, [FromQuery] string? dateTo)
    {
        var csv = new System.Text.StringBuilder();
        var fileName = $"{reportType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        if (reportType == "appointments")
        {
            var response = await _appointmentApiClient.GetAppointmentsAsync(dateFrom, dateTo, null);
            var appointments = response?.Content ?? new List<AppointmentDto>();

            csv.AppendLine("Id,DoctorId,Status");
            foreach (var a in appointments)
                csv.AppendLine($"{a.Id},{a.DoctorId},{a.Status}");
        }
        else if (reportType == "revenue")
        {
            var response = await _billingApiClient.GetInvoicesAsync(dateFrom, dateTo);
            var invoices = response?.Content ?? new List<InvoiceDto>();

            csv.AppendLine("Id,Status,TotalAmount");
            foreach (var i in invoices)
                csv.AppendLine($"{i.Id},{i.Status},{i.TotalAmount}");
        }
        else
        {
            return BadRequest(new { message = $"Unknown reportType '{reportType}'. Valid values: appointments, revenue" });
        }

        var downloadUrl = await _reportStorage.UploadReportAsync(fileName, csv.ToString());

        return Ok(new { downloadUrl, expiresInSeconds = 3600 });
    }
}

public class RoleUpdateRequest
{
    public string Role { get; set; } = string.Empty;
}
