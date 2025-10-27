document.getElementById('calculate-btn').addEventListener('click', function() {
    // --- Get all input values ---
    const area_lote = parseFloat(document.getElementById('area_lote').value) || 0;
    let coeficiente_constructibilidad = parseFloat(document.getElementById('coeficiente_constructibilidad').value) || 0;
    const fusion_lote = document.getElementById('fusion_lote').checked;
    let pisos = parseInt(document.getElementById('pisos').value) || 0;
    const sombras = document.getElementById('sombras').checked;

    // --- Initial Logic ---
    if (fusion_lote) {
        coeficiente_constructibilidad *= 1.3;
    }

    if (sombras) {
        pisos = 9;
    }

    // --- Estacionamientos Vivienda Colectiva ---
    const viviendas_hasta_70 = parseInt(document.getElementById('viviendas_hasta_70').value) || 0;
    const viviendas_70_110 = parseInt(document.getElementById('viviendas_70_110').value) || 0;
    const viviendas_110_140 = parseInt(document.getElementById('viviendas_110_140').value) || 0;
    const viviendas_140_180 = parseInt(document.getElementById('viviendas_140_180').value) || 0;
    const viviendas_mas_180 = parseInt(document.getElementById('viviendas_mas_180').value) || 0;

    let total_estacionamientos_residentes = 
        (viviendas_hasta_70 * 1) + 
        (viviendas_70_110 * 2) + 
        (viviendas_110_140 * 2.5) + 
        (viviendas_140_180 * 3) + 
        (viviendas_mas_180 * 3.5);
    
    const estacionamientos_visitas = total_estacionamientos_residentes * 0.20;
    const vivienda = total_estacionamientos_residentes + estacionamientos_visitas;

    // --- Estacionamientos Comercio ---
    const area_comercio = parseFloat(document.getElementById('area_comercio').value) || 0;
    let comercio = 0;
    if (area_comercio > 0) {
        if (area_comercio <= 200) {
            comercio = Math.max(Math.ceil(area_comercio / 30), 3);
        } else {
            comercio = Math.ceil(area_comercio / 25);
        }
    }

    // --- Estacionamientos Oficinas ---
    const area_oficinas = parseFloat(document.getElementById('area_oficinas').value) || 0;
    let oficinas = 0;
    if (area_oficinas > 0) {
        if (area_oficinas <= 200) {
            oficinas = Math.max(Math.ceil(area_oficinas / 30), 3);
        } else {
            oficinas = Math.ceil(area_oficinas / 25);
        }
    }

    // --- Total Estacionamientos ---
    const total_estacionamientos = vivienda + comercio + oficinas;

    // --- Estacionamientos Discapacidad ---
    let discapacidad = 0;
    if (total_estacionamientos > 0 && total_estacionamientos <= 20) {
        discapacidad = 1;
    } else if (total_estacionamientos >= 21 && total_estacionamientos <= 50) {
        discapacidad = 2;
    } else if (total_estacionamientos >= 51 && total_estacionamientos <= 200) {
        discapacidad = 3;
    } else if (total_estacionamientos >= 201 && total_estacionamientos <= 400) {
        discapacidad = 4;
    } else if (total_estacionamientos >= 401 && total_estacionamientos <= 500) {
        discapacidad = 5;
    } else if (total_estacionamientos > 500) {
        discapacidad = Math.ceil(total_estacionamientos * 0.01);
    }

    const total_con_discapacidad = total_estacionamientos + discapacidad;

    // --- Carga de Ocupación --- 
    const max_ocupacion = Math.floor((area_lote / 10000) * 508);
    const viviendas_maximas = Math.floor(max_ocupacion / 4);

    // --- Rangos Estacionamiento (Bicicletas) ---
    let bicicletas_res_html = '';
    if (max_ocupacion <= 50) {
        bicicletas_res_html = `<p>La normativa de bicicletas no aplica (carga de ocupación ${max_ocupacion} <= 50).</p>`;
    } else {
        const dotacion_inicial_autos = total_con_discapacidad;
        
        // Escenario 1: MAXIMO de autos
        const max_autos = dotacion_inicial_autos;
        const bicis_con_max_autos = Math.ceil(max_autos / 2);

        // Escenario 2: MINIMO de autos
        const reduccion_en_autos = Math.floor(dotacion_inicial_autos / 3);
        const min_autos = dotacion_inicial_autos - reduccion_en_autos;
        const bicis_adicionales_por_reduccion = reduccion_en_autos * 3;
        const bicis_base_para_min_autos = Math.ceil(min_autos / 2);
        const bicis_con_min_autos = bicis_base_para_min_autos + bicis_adicionales_por_reduccion;

        bicicletas_res_html = `
            <p><strong>Escenario 1 (Máximo Autos):</strong></p>
            <p>${Math.ceil(max_autos)} estacionamientos de auto y ${bicis_con_max_autos} de bicicleta.</p>
            <p><strong>Escenario 2 (Mínimo Autos con Incentivo):</strong></p>
            <p>${Math.ceil(min_autos)} estacionamientos de auto y ${bicis_con_min_autos} de bicicleta.</p>
        `;
    }

    // --- Superficie Construible ---
    const superficie_construible = area_lote * coeficiente_constructibilidad;

    // --- Calculate Total Built Area for Validation ---
    // Using upper bounds for housing unit areas for a conservative estimate
    const total_vivienda_area = 
        (viviendas_hasta_70 * 70) + 
        (viviendas_70_110 * 110) + 
        (viviendas_110_140 * 140) + 
        (viviendas_140_180 * 180) + 
        (viviendas_mas_180 * 200); // Assuming 200m² for units >= 180m²

    const total_built_area = total_vivienda_area + area_comercio + area_oficinas;

    // --- Validation Check ---
    if (total_built_area > superficie_construible) {
        document.getElementById('results').style.display = 'block';
        document.getElementById('superficie_construible_res').innerHTML = `<p style="color: red; font-weight: bold;">Error: La superficie construida (${total_built_area.toFixed(2)} m²) excede la superficie máxima construible (${superficie_construible.toFixed(2)} m²).</p>`;

        document.getElementById('pisos_final_res').innerText = '';
        document.getElementById('est_vivienda_res').innerText = '';
        document.getElementById('est_comercio_res').innerText = '';
        document.getElementById('est_oficinas_res').innerText = '';
        document.getElementById('total_estacionamientos_res').innerText = '';
        document.getElementById('est_discapacidad_res').innerText = '';
        document.getElementById('total_con_discapacidad_res').innerText = '';
        document.getElementById('bicicletas_res').innerHTML = '';
        document.getElementById('viviendas_maximas_res').innerText = '';
        return; // Stop further calculations and display
    }

    // --- Display Results ---
    document.getElementById('results').style.display = 'block';
    document.getElementById('superficie_construible_res').innerText = `Superficie Máxima Construible: ${superficie_construible.toFixed(2)} m²`;

    document.getElementById('pisos_final_res').innerText = `Número de Pisos Final: ${pisos}`;
    document.getElementById('max_ocupacion_res').innerText = `Ocupación Máxima: ${max_ocupacion} personas`;
    document.getElementById('viviendas_maximas_res').innerText = `Viviendas Máximas: ${viviendas_maximas}`;
    
    document.getElementById('est_vivienda_res').innerText = `Estacionamientos de Vivienda (incl. visitas): ${vivienda.toFixed(2)}`;
    document.getElementById('est_comercio_res').innerText = `Estacionamientos de Comercio: ${comercio}`;
    document.getElementById('est_oficinas_res').innerText = `Estacionamientos de Oficinas: ${oficinas}`;
    document.getElementById('total_estacionamientos_res').innerText = `Total Estacionamientos (sin discapacidad): ${total_estacionamientos.toFixed(2)}`;
    document.getElementById('est_discapacidad_res').innerText = `Estacionamientos para Discapacidad: ${discapacidad}`;
    document.getElementById('total_con_discapacidad_res').innerHTML = `<strong>Dotación Total Requerida (con discapacidad): ${Math.ceil(total_con_discapacidad)}</strong>`;

    document.getElementById('bicicletas_res').innerHTML = bicicletas_res_html;
});
