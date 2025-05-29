

模拟信号

```bash
adb root && adb shell
vehicle_tool -s DEBUG_COMMAND:enable_test_mode=1 # 开启模拟
vehicle_tool -s VehSpd:120   # VehSpd 信号名 或 id : 值 （冒号后不能有空格）
```
