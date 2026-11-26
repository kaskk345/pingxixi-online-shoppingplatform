package com.mall.controller;

import com.mall.common.Result;
import com.mall.dto.AddressView;
import com.mall.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 客户收货地址簿（挑战 C.2）：多地址维护 + 默认地址。
 */
@RestController
@RequestMapping("/api/customer/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public Result<List<AddressView>> list(@RequestAttribute("customerId") Long customerId) {
        return Result.ok(addressService.list(customerId));
    }

    @PostMapping
    public Result<AddressView> create(@RequestAttribute("customerId") Long customerId,
                                      @RequestBody AddressReq req) {
        return Result.ok(addressService.create(customerId, req.receiverName(), req.receiverPhone(),
                req.region(), req.detail(), req.isDefault()));
    }

    @PutMapping("/{id}")
    public Result<AddressView> update(@RequestAttribute("customerId") Long customerId,
                                      @PathVariable Long id,
                                      @RequestBody AddressReq req) {
        return Result.ok(addressService.update(customerId, id, req.receiverName(), req.receiverPhone(),
                req.region(), req.detail(), req.isDefault()));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@RequestAttribute("customerId") Long customerId, @PathVariable Long id) {
        addressService.delete(customerId, id);
        return Result.ok();
    }

    @PostMapping("/{id}/default")
    public Result<AddressView> setDefault(@RequestAttribute("customerId") Long customerId,
                                          @PathVariable Long id) {
        return Result.ok(addressService.setDefault(customerId, id));
    }

    public record AddressReq(
            String receiverName,
            String receiverPhone,
            String region,
            String detail,
            Boolean isDefault
    ) {
    }
}
