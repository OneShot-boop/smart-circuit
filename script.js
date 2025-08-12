function calculate() {
    // 1. Сбор данных, введенных пользователем.  Преобразуем строковые значения в числа с плавающей точкой.
    const power = parseFloat(document.getElementById('power').value); // Мощность нагрузки (Вт)
    const voltage = parseFloat(document.getElementById('voltage').value); // Напряжение сети (В)
    const length = parseFloat(document.getElementById('length').value); // Длина кабеля (м)
    const material = document.getElementById('material').value;   // Материал кабеля (медь/алюминий)
    const installation = document.getElementById('installation').value; // Условия прокладки кабеля.

    // 2. Расчет тока нагрузки (I = P / U), где P - мощность, U - напряжение.
    const currentLoad = power / voltage;

    // 3.  Определение удельного сопротивления проводника в зависимости от материала.
    const resistivityCopper = 0.0175; // Ом*мм²/м при 20°C
    const resistivityAluminum = 0.028; // Ом*мм²/м при 20°C
    let resistivity = (material === 'copper') ? resistivityCopper : resistivityAluminum;
    let cableSection;

    // 4. Приблизительный выбор сечения кабеля.  Начинаем с минимального, чтобы проверить падение напряжения.
    cableSection = (material === 'copper') ? 1.5 : 2.5;

    // 5. Расчет сопротивления кабеля (R = (ρ * L) / S), где ρ - удельное сопротивление, L - длина, S - сечение.
    const resistance = (resistivity * length) / cableSection;

    // 6. Расчет падения напряжения (dV = 2 * I * R).  Умножаем на 2, учитывая прямой и обратный проводники.
    const voltageDrop = 2 * currentLoad * resistance;

    // 7. Проверка падения напряжения. Если превышает допустимый предел (обычно 5% от напряжения сети), увеличиваем сечение.
    const allowedVoltageDrop = voltage * 0.05;
    while (voltageDrop > allowedVoltageDrop) {
        cableSection += (material === 'copper') ? 0.5 : 1; // Шаг увеличения сечения
        const resistance = (resistivity * length) / cableSection;
        const voltageDrop = 2 * currentLoad * resistance;
        if (cableSection>10) break;
    }

    // 8.  Выбор номинала автоматического выключателя (с запасом +25% к току нагрузки).
    const breakerRating = Math.ceil(currentLoad * 1.25);

    // 9. Выбор УЗО (ток утечки - стандартно 30mA).
    const rcdRating = 30;

    // 10. Вывод результатов расчета на страницу.
    document.getElementById('cable-section').innerText = cableSection.toFixed(1); // Округляем до 1 знака после запятой
    document.getElementById('breaker').innerText = breakerRating;
    document.getElementById('rcd').innerText = rcdRating;
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Отчет по электрорасчету", 10, 10);
    doc.setFontSize(12);
    doc.text(`Рекомендуемое сечение кабеля: ${document.getElementById('cable-section').innerText} мм²`, 10, 20);
    doc.text(`Подходящий автомат: ${document.getElementById('breaker').innerText} A`, 10, 30);
    doc.text(`Рекомендуемое УЗО: ${document.getElementById('rcd').innerText} мА`, 10, 40);
    doc.save("electro_report.pdf");
}
