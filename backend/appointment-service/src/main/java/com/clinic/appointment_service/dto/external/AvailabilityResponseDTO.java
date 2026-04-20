package com.clinic.appointment_service.dto.external;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class AvailabilityResponseDTO {
    private UUID doctorId;
    private String date;
    private List<SlotDTO> slots;

    @Data
    public static class SlotDTO {
        private String start;
        private String end;
        private boolean available;
    }
}
