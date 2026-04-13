package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.IotDeviceService;
import com.faceattend_edu.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.domain.dto.response.IotDeviceResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/iot-devices")
public class IotDeviceController {

    private final IotDeviceService iotDeviceService;

    @GetMapping
    public ResponseEntity<List<IotDeviceResponse>> findAll() {
        return ResponseEntity.ok(iotDeviceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IotDeviceResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(iotDeviceService.findById(id));
    }

    @PostMapping
    public ResponseEntity<IotDeviceResponse> save(@Valid @RequestBody IotDeviceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(iotDeviceService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IotDeviceResponse> update(@PathVariable Integer id, @Valid @RequestBody IotDeviceRequest request) {
        return ResponseEntity.ok(iotDeviceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        iotDeviceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
